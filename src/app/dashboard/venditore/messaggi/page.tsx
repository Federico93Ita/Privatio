"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string };
  createdAt: string;
}

export default function SellerMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dashboard/seller")
      .then((r) => r.json())
      .then((data) => {
        if (data.property?.id) {
          setPropertyId(data.property.id);
        }
        if (data.agency) {
          setAgencyName(data.agency.name);
          if (data.agency.agents?.[0]) {
            setAgentId(data.agency.agents[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchMessages = useCallback(() => {
    if (!propertyId) return;
    fetch(`/api/messages?propertyId=${propertyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      })
      .catch(console.error);
  }, [propertyId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!newMessage.trim() || !propertyId || !agentId) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          receiverId: agentId,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  const userId = session?.user?.id;

  return (
    <DashboardLayout role="seller">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text mb-4">Messaggi</h1>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !agencyName || !propertyId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-primary-dark mb-2">Messaggi non disponibili</h3>
              <p className="text-text-muted">I messaggi saranno disponibili dopo l&apos;assegnazione dell&apos;agenzia.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-t-xl border border-border px-5 py-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{agencyName.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-primary-dark">{agencyName}</p>
                <p className="text-xs text-text-muted">Agenzia partner</p>
              </div>
            </div>

            <div className="flex-1 bg-bg-soft border-x border-border p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-text-muted text-sm">Nessun messaggio. Inizia la conversazione con la tua agenzia.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          isMine
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-white text-text border border-border rounded-bl-sm"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-text-muted"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="bg-white rounded-b-xl border border-border p-3 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                placeholder="Scrivi un messaggio..."
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-dark transition-colors"
              >
                {sending ? "..." : "Invia"}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
