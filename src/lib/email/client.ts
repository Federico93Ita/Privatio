import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import type { SendEmailOptions, SendEmailResult } from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = process.env.EMAIL_FROM || "Privatio <noreply@privatio.it>";
const DEFAULT_REPLY_TO = process.env.EMAIL_REPLY_TO || "info@privatio.it";

/** Mittente per email di billing (fatturazione, pagamenti, abbonamenti) */
export const BILLING_FROM =
  process.env.EMAIL_FROM_BILLING || "Privatio Billing <fatturazione@privatio.it>";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Invia un'email tramite Resend con logging su EmailLog e retry automatico.
 *
 * Backward compatible con la vecchia firma { to, subject, html }.
 * I nuovi campi (templateName, category, metadata) sono opzionali.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const {
    to,
    subject,
    html,
    replyTo = DEFAULT_REPLY_TO,
    from = DEFAULT_FROM,
    templateName,
    category = "TRANSACTIONAL",
    metadata,
  } = options;

  // Check se il destinatario ha email invalida (bounce/complaint)
  try {
    const user = await prisma.user.findUnique({
      where: { email: to },
      select: { emailInvalid: true },
    });
    if (user?.emailInvalid) {
      console.warn(`[email] Skipping send to ${to}: emailInvalid=true`);
      return { success: false, error: "Email address marked as invalid" };
    }
  } catch {
    // Se il lookup fallisce, procediamo comunque (potrebbe essere un non-utente)
  }

  // Crea EmailLog con status QUEUED
  let logId: string | undefined;
  try {
    const log = await prisma.emailLog.create({
      data: {
        to,
        from,
        subject,
        templateName: templateName ?? null,
        category,
        status: "QUEUED",
        metadata: metadata
          ? (JSON.parse(JSON.stringify(metadata)) as Record<string, string>)
          : undefined,
      },
    });
    logId = log.id;
  } catch (err) {
    console.error("[email] Failed to create EmailLog:", err);
  }

  // Invio con retry
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        replyTo,
        subject,
        html,
      });

      if (error) {
        lastError = error;
        console.error(
          `[email] Resend error (attempt ${attempt}/${MAX_RETRIES}):`,
          error
        );
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
      } else {
        // Successo — aggiorna EmailLog
        if (logId) {
          try {
            await prisma.emailLog.update({
              where: { id: logId },
              data: {
                resendId: data?.id ?? null,
                status: "SENT",
                sentAt: new Date(),
                attempts: attempt,
              },
            });
          } catch (err) {
            console.error("[email] Failed to update EmailLog:", err);
          }
        }
        return { success: true, data: data ? { id: data.id } : undefined };
      }
    } catch (err) {
      lastError = err;
      console.error(
        `[email] Exception (attempt ${attempt}/${MAX_RETRIES}):`,
        err
      );
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  // Tutti i tentativi falliti — aggiorna EmailLog
  if (logId) {
    try {
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: "FAILED",
          lastError:
            lastError instanceof Error
              ? lastError.message
              : JSON.stringify(lastError),
          attempts: MAX_RETRIES,
        },
      });
    } catch (err) {
      console.error("[email] Failed to update EmailLog on failure:", err);
    }
  }

  return { success: false, error: lastError };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
