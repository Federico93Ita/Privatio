"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function BuyerProfilePage() {
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  // GDPR
  const [exporting, setExporting] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setPhone(data.phone || "");
        }
      } catch {
        // Use session data as fallback
        if (session?.user?.name) setName(session.user.name);
      }
    }
    fetchProfile();
  }, [session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nel salvataggio");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("Le password non corrispondono.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("La nuova password deve avere almeno 8 caratteri.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nel cambio password");
      }
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Errore");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `privatio-dati-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // silently fail
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirm,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nell'eliminazione");
      }
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Errore");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout role="buyer">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="font-heading text-2xl tracking-wide text-primary-dark sm:text-3xl">
            Il Tuo Profilo
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gestisci le tue informazioni personali.
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-primary-dark">Dati Personali</h2>

          {success && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
              Profilo aggiornato con successo.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-soft text-text-muted"
            />
            <p className="text-xs text-text-muted mt-1">L&apos;email non può essere modificata.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Nome e Cognome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Telefono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "Salva Modifiche"}
          </button>
        </form>

        {/* Password Change */}
        <form onSubmit={handlePasswordChange} className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-primary-dark">Cambia Password</h2>

          {pwSuccess && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
              Password cambiata con successo.
            </div>
          )}
          {pwError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
              {pwError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1">Password Attuale</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nuova Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimo 8 caratteri"
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Conferma Nuova Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={pwSaving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {pwSaving ? "Cambio in corso..." : "Cambia Password"}
          </button>
        </form>

        {/* Privacy & Data (GDPR) */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-primary-dark">Privacy e Dati</h2>
          <p className="text-sm text-text-muted">
            Ai sensi del GDPR, puoi esportare o eliminare tutti i tuoi dati personali.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg-soft transition-colors disabled:opacity-50"
            >
              {exporting ? "Esportazione..." : "Esporta i miei dati"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteSection(!showDeleteSection)}
              className="rounded-lg border border-[#ef4444]/30 px-4 py-2 text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors"
            >
              Elimina account
            </button>
          </div>

          {showDeleteSection && (
            <form onSubmit={handleDelete} className="mt-4 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5 p-4 space-y-3">
              <p className="text-sm font-medium text-[#ef4444]">
                Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati permanentemente.
              </p>
              {deleteError && (
                <div className="p-2 rounded bg-[#ef4444]/10 text-xs text-[#ef4444]">{deleteError}</div>
              )}
              <div>
                <label className="block text-xs font-medium text-text mb-1">Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">
                  Scrivi &quot;ELIMINA IL MIO ACCOUNT&quot; per confermare
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={deleting || deleteConfirm !== "ELIMINA IL MIO ACCOUNT"}
                className="rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#dc2626] transition-colors disabled:opacity-50"
              >
                {deleting ? "Eliminazione..." : "Elimina Account Definitivamente"}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
