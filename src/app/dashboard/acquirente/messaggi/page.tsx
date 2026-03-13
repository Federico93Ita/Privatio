"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Message {
  id: string;
  content: string;
  createdAt: string;
  read: boolean;
  senderId: string;
  sender: { name: string };
  receiver: { name: string };
  property?: { title: string; slug: string } | null;
}

interface Conversation {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastDate: string;
  unread: number;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function BuyerMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [convMessages, setConvMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        buildConversations(data.messages || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function buildConversations(msgs: Message[]) {
    const convMap = new Map<string, Conversation>();

    for (const msg of msgs) {
      const otherUserId = msg.senderId === userId ? msg.receiver?.name : msg.sender?.name;
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      const otherUID = msg.senderId === userId
        ? (msg as any).receiverId
        : msg.senderId;
      const propId = (msg as any).propertyId || "general";
      const key = `${propId}-${otherUID}`;

      if (!convMap.has(key)) {
        convMap.set(key, {
          propertyId: propId,
          propertyTitle: msg.property?.title || "Messaggio diretto",
          propertySlug: msg.property?.slug || "",
          otherUserId: otherUID,
          otherUserName: otherUser?.name || "Utente",
          lastMessage: msg.content,
          lastDate: msg.createdAt,
          unread: 0,
        });
      }

      const conv = convMap.get(key)!;
      if (new Date(msg.createdAt) > new Date(conv.lastDate)) {
        conv.lastMessage = msg.content;
        conv.lastDate = msg.createdAt;
      }
      if (!msg.read && msg.senderId !== userId) {
        conv.unread++;
      }
    }

    const sorted = Array.from(convMap.values()).sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    );
    setConversations(sorted);
  }

  function selectConversation(conv: Conversation) {
    setSelectedConv(conv);
    const filtered = messages.filter((m) => {
      const propId = (m as any).propertyId || "general";
      const otherUID = m.senderId === userId ? (m as any).receiverId : m.senderId;
      return propId === conv.propertyId && otherUID === conv.otherUserId;
    });
    setConvMessages(filtered.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedConv.otherUserId,
          propertyId: selectedConv.propertyId !== "general" ? selectedConv.propertyId : undefined,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage("");
        await fetchMessages();
        if (selectedConv) {
          // Re-select to refresh messages
          setTimeout(() => {
            selectConversation(selectedConv);
          }, 200);
        }
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardLayout role="buyer">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark sm:text-3xl">
            Messaggi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Comunica con venditori e agenzie.
          </p>
        </div>

        <div className="flex h-[calc(100vh-16rem)] rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          {/* Conversation List */}
          <div className="w-full max-w-xs border-r border-border overflow-y-auto">
            {loading && (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 w-3/4 rounded bg-border/50" />
                    <div className="h-3 w-1/2 rounded bg-border/50" />
                  </div>
                ))}
              </div>
            )}

            {!loading && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-text-muted" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-sm text-text-muted">Nessun messaggio.</p>
              </div>
            )}

            {conversations.map((conv) => (
              <button
                key={`${conv.propertyId}-${conv.otherUserId}`}
                type="button"
                onClick={() => selectConversation(conv)}
                className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-bg-soft ${
                  selectedConv?.propertyId === conv.propertyId && selectedConv?.otherUserId === conv.otherUserId
                    ? "bg-primary/5"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text truncate">{conv.otherUserName}</span>
                  {conv.unread > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted truncate">{conv.propertyTitle}</p>
                <p className="text-xs text-text-muted truncate mt-1">{conv.lastMessage}</p>
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {!selectedConv ? (
              <div className="flex flex-1 items-center justify-center text-text-muted">
                <p className="text-sm">Seleziona una conversazione</p>
              </div>
            ) : (
              <>
                {/* Thread Header */}
                <div className="border-b border-border p-4">
                  <p className="text-sm font-semibold text-text">{selectedConv.otherUserName}</p>
                  <p className="text-xs text-text-muted">{selectedConv.propertyTitle}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {convMessages.map((msg) => {
                    const isMine = msg.senderId === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-bg-soft text-text rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-text-muted"}`}>
                            {new Date(msg.createdAt).toLocaleString("it-IT", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Message */}
                <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {sending ? "..." : "Invia"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
