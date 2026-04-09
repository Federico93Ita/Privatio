"use client";

/**
 * ChatWidget — assistente AI Privatio.
 * Bottone flottante + pannello chat con streaming SSE da /api/chat.
 * Persistenza in sessionStorage.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface StoredState {
  sessionId: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = "privatio-chat-v1";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Ciao! Sei un venditore o un'agenzia? Posso aiutarti a capire come funziona Privatio.",
};

const QUICK_REPLIES: readonly string[] = [
  "Come funziona per i venditori",
  "Quanto costa per un'agenzia",
  "Cosa vuol dire zero commissioni",
  "Come mi registro come agenzia",
];

const HIDDEN_PREFIXES = ["/admin", "/dashboard"];

function loadState(): StoredState {
  if (typeof window === "undefined") {
    return { sessionId: "", messages: [WELCOME] };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      if (parsed.sessionId && Array.isArray(parsed.messages)) return parsed;
    }
  } catch {
    // ignore
  }
  return {
    sessionId: crypto.randomUUID(),
    messages: [WELCOME],
  };
}

export default function ChatWidget(): React.ReactElement | null {
  const pathname = usePathname() ?? "/";
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [sessionId, setSessionId] = useState<string>("");
  const [streaming, setStreaming] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Hydrate from sessionStorage on mount.
  useEffect(() => {
    const s = loadState();
    setSessionId(s.sessionId);
    setMessages(s.messages);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!sessionId) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sessionId, messages } satisfies StoredState)
      );
    } catch {
      // quota or disabled — ignore
    }
  }, [sessionId, messages]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // ESC to close + focus management.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // initial focus
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const newUserMsg: ChatMessage = { role: "user", content: trimmed };
      const next = [...messages, newUserMsg];
      setMessages([...next, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            pagePath:
              typeof window !== "undefined" ? window.location.pathname : "/",
            messages: next,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("HTTP " + res.status);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            try {
              const payload = JSON.parse(line.slice(5).trim()) as
                | { type: "delta"; text: string }
                | { type: "done" };
              if (payload.type === "delta") {
                acc += payload.text;
                setMessages((curr) => {
                  const copy = [...curr];
                  copy[copy.length - 1] = {
                    role: "assistant",
                    content: acc,
                  };
                  return copy;
                });
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }

        if (!acc) {
          setMessages((curr) => {
            const copy = [...curr];
            copy[copy.length - 1] = {
              role: "assistant",
              content:
                "Mi dispiace, non sono riuscito a rispondere. Riprova tra poco oppure scrivici a info@privatio.it.",
            };
            return copy;
          });
        }
      } catch {
        setMessages((curr) => {
          const copy = [...curr];
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              "Mi dispiace, ho avuto un problema di connessione. Riprova tra poco oppure scrivici a info@privatio.it.",
          };
          return copy;
        });
      } finally {
        setStreaming(false);
      }
    },
    [messages, sessionId, streaming]
  );

  if (hidden) return null;

  return (
    <>
      {/* Floating button */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="Apri assistente Privatio"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          open && "pointer-events-none opacity-0"
        )}
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Assistente Privatio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 flex flex-col bg-white shadow-2xl inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px] sm:rounded-2xl border border-[var(--color-border)] overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: "var(--color-primary)", color: "white" }}
            >
              <div>
                <p className="text-sm font-semibold">Assistente Privatio</p>
                <p className="text-xs opacity-80">Risponde subito · IT</p>
              </div>
              <button
                type="button"
                aria-label="Chiudi assistente"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="rounded p-1 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ backgroundColor: "var(--color-bg-soft)" }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed",
                      m.role === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-white text-[var(--color-text)] rounded-bl-sm border border-[var(--color-border)]"
                    )}
                    style={
                      m.role === "user"
                        ? { backgroundColor: "var(--color-primary)" }
                        : undefined
                    }
                  >
                    {m.content || (
                      <span className="inline-flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Quick replies — solo se siamo all'inizio */}
              {messages.length === 1 && !streaming && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="rounded-full border border-[var(--color-primary)] bg-white px-3 py-1 text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="border-t border-[var(--color-border)] bg-white p-3"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  rows={1}
                  placeholder="Scrivi la tua domanda…"
                  aria-label="Messaggio"
                  className="flex-1 resize-none rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] max-h-32"
                  disabled={streaming}
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  aria-label="Invia messaggio"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">
                Le risposte sono generate da un AI. Per dettagli legali o stime
                specifiche scrivi a info@privatio.it.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
