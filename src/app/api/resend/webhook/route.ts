import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Webhook Resend per tracking delivery email.
 *
 * Eventi gestiti:
 * - email.delivered → EmailLog status DELIVERED
 * - email.bounced → EmailLog BOUNCED + gestione emailInvalid
 * - email.complained → EmailLog COMPLAINED + emailInvalid immediato
 * - email.opened → aggiorna openedAt
 */

interface ResendWebhookPayload {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.bounced"
    | "email.complained"
    | "email.opened";
  data: {
    email_id: string;
    to: string[];
    from: string;
    subject: string;
    created_at: string;
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  // Verifica firma Resend (svix)
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing signature headers" },
      { status: 400 }
    );
  }

  const body = await req.text();

  // Verifica la firma HMAC
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const secret = webhookSecret.startsWith("whsec_")
    ? webhookSecret.slice(6)
    : webhookSecret;
  const secretBytes = Buffer.from(secret, "base64");
  const expectedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  const signatures = svixSignature.split(" ");
  const isValid = signatures.some((sig) => {
    const sigValue = sig.startsWith("v1,") ? sig.slice(3) : sig;
    return sigValue === expectedSignature;
  });

  if (!isValid) {
    console.error("[resend-webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Verifica timestamp (tolleranza 5 minuti)
  const timestamp = parseInt(svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return NextResponse.json({ error: "Timestamp too old" }, { status: 400 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = payload;
  const emailId = data.email_id;
  const recipientEmail = data.to?.[0];
  const now_ts = new Date();

  try {
    switch (type) {
      case "email.delivered": {
        await prisma.emailLog.updateMany({
          where: { resendId: emailId },
          data: { status: "DELIVERED", deliveredAt: now_ts },
        });
        break;
      }

      case "email.bounced": {
        await prisma.emailLog.updateMany({
          where: { resendId: emailId },
          data: { status: "BOUNCED", bouncedAt: now_ts },
        });

        // Incrementa bounce count e flagga se >= 2
        if (recipientEmail) {
          const user = await prisma.user.findUnique({
            where: { email: recipientEmail },
            select: { id: true, emailBounceCount: true },
          });
          if (user) {
            const newCount = user.emailBounceCount + 1;
            await prisma.user.update({
              where: { id: user.id },
              data: {
                emailBounceCount: newCount,
                emailInvalid: newCount >= 2,
              },
            });
            if (newCount >= 2) {
              console.warn(
                `[resend-webhook] User ${recipientEmail} marked as emailInvalid after ${newCount} bounces`
              );
            }
          }
        }
        break;
      }

      case "email.complained": {
        await prisma.emailLog.updateMany({
          where: { resendId: emailId },
          data: { status: "COMPLAINED", complainedAt: now_ts },
        });

        // Complaint → emailInvalid immediato
        if (recipientEmail) {
          await prisma.user.updateMany({
            where: { email: recipientEmail },
            data: { emailInvalid: true },
          });
          console.warn(
            `[resend-webhook] User ${recipientEmail} marked as emailInvalid after complaint`
          );
        }
        break;
      }

      case "email.opened": {
        // Aggiorna solo il primo open
        await prisma.emailLog.updateMany({
          where: { resendId: emailId, openedAt: null },
          data: { openedAt: now_ts },
        });
        break;
      }
    }
  } catch (err) {
    console.error("[resend-webhook] Error processing event:", err);
    return NextResponse.json(
      { error: "Processing error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
