"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CheckAllIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L7 17l-5-5" />
      <path d="M22 10l-7.5 7.5L13 16" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Type → icon/color helpers                                          */
/* ------------------------------------------------------------------ */

const TYPE_ICONS: Record<string, { emoji: string; color: string }> = {
  LEAD_RECEIVED:       { emoji: "📩", color: "bg-blue-100 text-blue-700" },
  PROPERTY_ASSIGNED:   { emoji: "🏠", color: "bg-green-100 text-green-700" },
  VISIT_SCHEDULED:     { emoji: "📅", color: "bg-purple-100 text-purple-700" },
  VISIT_CONFIRMED:     { emoji: "✅", color: "bg-emerald-100 text-emerald-700" },
  CONTRACT_SIGNED:     { emoji: "📝", color: "bg-amber-100 text-amber-700" },
  PAYMENT_FAILED:      { emoji: "⚠️", color: "bg-red-100 text-red-700" },
  TERRITORY_ACTIVATED: { emoji: "📍", color: "bg-cyan-100 text-cyan-700" },
  SYSTEM:              { emoji: "🔔", color: "bg-gray-100 text-gray-700" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "ora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h fa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g fa`;
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (full = false) => {
    try {
      const res = await fetch(`/api/notifications?limit=${full ? 20 : 5}`);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Re-fetch full list when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications(true);
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Mark all as read
  async function markAllRead() {
    setLoading(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setLoading(false);
  }

  // Click a notification
  async function handleClick(n: Notification) {
    if (!n.read) {
      fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.href) {
      setOpen(false);
      window.location.href = n.href;
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-soft hover:text-text"
        aria-label="Notifiche"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl border border-border bg-white shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text">Notifiche</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  <CheckAllIcon />
                  Segna tutte lette
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-text-muted">Nessuna notifica</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.SYSTEM;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-bg-soft border-b border-border/50 last:border-0 ${
                        !n.read ? "bg-primary/3" : ""
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${typeInfo.color}`}>
                        {typeInfo.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? "font-semibold text-text" : "text-text"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[11px] text-text-muted/70 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
