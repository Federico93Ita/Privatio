"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Conversation {
  propertyId: string;
  property?: { id: string; title: string; city: string };
  lastMessage: {
    content: string;
    createdAt: string;
    sender: { name: string };
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string };
  createdAt: string;
}

export default function AgencyMessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [selectedSellerName, setSelectedSellerName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sellerMap, setSellerMap] = useState<Record<string, { id: string; name: string }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations + agency data to get seller IDs
  useEffect(() => {
    Promise.all([
      fetch("/api/messages").then((r) => r.json()),
      fetch("/api/dashboard/agency").then((r) => r.json()),
    ])
      .then(([msgData, agencyData]) => {
        if (msgData.conversations) {
          setConversations(msgData.conversations);
        }
        // Build a map of propertyId → seller info from agency data
        const map: Record<string, { id: string; name: string }> = {};
        if (agencyData.agency?.assignments) {
          for (const a of agencyData.agency.assignments) {
            if (a.property?.seller) {
              map[a.property.id] = {
                id: a.property.seller.id || "",
                name: a.property.seller.name || "Venditore",
              };
            }
          }
        }
        setSellerMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchMessages = useCallback(() => {
    if (!selectedPropertyId) return;
    fetch(`/api/messages?propertyId=${selectedPropertyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      })
      .catch(console.error);
  }, [selectedPropertyId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function selectConversation(propertyId: string) {
    setSelectedPropertyId(propertyId);
    const seller = sellerMap[propertyId];
    setSelectedSellerId(seller?.id || null);
    setSelectedSellerName(seller?.name || "Venditore");
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedPropertyId || !selectedSellerId) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          receiverId: selectedSellerId,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        alert("Errore nell'invio del messaggio. Riprova.");
      }
    } catch {
      alert("Errore di connessione. Riprova.");
    } finally {
      setSending(false);
    }
  }

  const userId = session?.user?.id;

  return (
    <DashboardLayout role="agency">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text mb-4">Messaggi</h1>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex rounded-xl border border-border overflow-hidden bg-white">
            {/* Conversation list */}
            <div className="w-80 border-r border-border overflow-y-auto flex-shrink-0">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-text-muted">Nessuna conversazione.</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.propertyId}
                    onClick={() => selectConversation(conv.propertyId)}
                    className={`w-full text-left px-4 py-3 border-b border-border hover:bg-bg-soft transition-colors ${
                      selectedPropertyId === conv.propertyId ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-dark truncate">
                          {conv.property?.title || "Immobile"}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {sellerMap[conv.propertyId]?.name || "Venditore"}
                        </p>
                        <p className="text-xs text-text-muted truncate mt-0.5">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {!selectedPropertyId ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-text-muted text-sm">Seleziona una conversazione</p>
                </div>
              ) : (
                <>
                  <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{selectedSellerName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-primary-dark text-sm">{selectedSellerName}</p>
                      <p className="text-xs text-text-muted">Venditore</p>
                    </div>
                  </div>

                  <div className="flex-1 bg-bg-soft p-4 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-text-muted text-sm">Nessun messaggio. Inizia la conversazione.</p>
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

                  <div className="p-3 border-t border-border flex gap-3">
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
                      className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/85 transition-colors"
                    >
                      {sending ? "..." : "Invia"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
