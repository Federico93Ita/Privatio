/**
 * Chatbot AI endpoint.
 * - Streams Claude responses via Server-Sent Events.
 * - Logs each (user, assistant) message pair to ChatbotLog (best-effort, fail-safe).
 * - Rate limited per IP.
 */

import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  CHATBOT_SYSTEM_PROMPT,
  isFallbackResponse,
} from "@/lib/chatbot-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 600;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const bodySchema = z.object({
  sessionId: z.string().min(1).max(128),
  pagePath: z.string().max(256).optional(),
  messages: z.array(messageSchema).min(1).max(20),
});

const FALLBACK_MESSAGE =
  "Mi dispiace, in questo momento non riesco a rispondere. Riprova tra poco oppure scrivici a info@privatio.it.";

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function logMessage(params: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  fallbackTriggered: boolean;
  userAgent: string | null;
  pagePath: string | null;
}): Promise<void> {
  try {
    await prisma.chatbotLog.create({ data: params });
  } catch (err) {
    Sentry.captureException(err, { tags: { area: "chatbot-log" } });
  }
}

export async function POST(req: Request): Promise<Response> {
  const limited = await applyRateLimit(RATE_LIMITS.chatbot, req);
  if (limited) return limited;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    Sentry.captureMessage("ANTHROPIC_API_KEY mancante", "error");
    return new Response(JSON.stringify({ error: "Servizio non configurato" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let parsed;
  try {
    const json = await req.json();
    parsed = bodySchema.parse(json);
  } catch {
    return new Response(JSON.stringify({ error: "Richiesta non valida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { sessionId, pagePath, messages } = parsed;
  const userAgent = req.headers.get("user-agent");
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  const anthropic = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = "";
      let sawError = false;

      try {
        const aiStream = anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: CHATBOT_SYSTEM_PROMPT,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        for await (const event of aiStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullText += text;
            controller.enqueue(
              encoder.encode(sse({ type: "delta", text }))
            );
          }
        }

        controller.enqueue(encoder.encode(sse({ type: "done" })));
      } catch (err) {
        sawError = true;
        Sentry.captureException(err, { tags: { area: "chatbot-stream" } });
        if (!fullText) fullText = FALLBACK_MESSAGE;
        controller.enqueue(
          encoder.encode(
            sse({
              type: "delta",
              text: fullText === FALLBACK_MESSAGE ? FALLBACK_MESSAGE : "",
            })
          )
        );
        controller.enqueue(encoder.encode(sse({ type: "done" })));
      } finally {
        controller.close();

        // Best-effort logging — never throws.
        const fallback =
          sawError || isFallbackResponse(fullText || FALLBACK_MESSAGE);

        if (lastUser) {
          await logMessage({
            sessionId,
            role: "user",
            content: lastUser.content,
            fallbackTriggered: false,
            userAgent,
            pagePath: pagePath ?? null,
          });
        }
        await logMessage({
          sessionId,
          role: "assistant",
          content: fullText || FALLBACK_MESSAGE,
          fallbackTriggered: fallback,
          userAgent,
          pagePath: pagePath ?? null,
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
