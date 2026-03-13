"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SellerProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveError, setSaveError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setPhone(data.user.phone || "");
        }
      })
      .catch(() => setSaveError("Errore nel caricamento del profilo. Riprova."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    setSaveError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg("Profilo aggiornato con successo!");
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setSaveError(data.error || "Errore nell'aggiornamento");
      }
    } catch {
      setSaveError("Errore di connessione");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setChangingPw(true);
    setPwMsg("");
    setPwError("");
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg("Password aggiornata con successo!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwMsg(""), 3000);
      } else {
        setPwError(data.error || "Errore nel cambio password");
      }
    } catch {
      setPwError("Errore di connessione");
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Il mio Profilo</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-bg-soft rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Profile form */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">Dati personali</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Il tuo nome"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-soft text-text-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-text-muted mt-1">L&apos;email non puo essere modificata.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Telefono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+39 ..."
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
                  />
                </div>
                {saveError && <p className="text-sm text-error">{saveError}</p>}
                {saveMsg && <p className="text-sm text-success font-medium">{saveMsg}</p>}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-dark transition-colors"
                >
                  {saving ? "Salvataggio..." : "Salva modifiche"}
                </button>
              </div>
            </div>

            {/* Data & Privacy — GDPR */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">Privacy e Dati Personali</h2>
              <p className="text-sm text-text-muted mb-4">
                Ai sensi del GDPR, puoi esportare tutti i tuoi dati personali o eliminare il tuo account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setExporting(true);
                    try {
                      const res = await fetch("/api/user/export");
                      if (res.ok) {
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `privatio-dati-personali-${new Date().toISOString().split("T")[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    } catch { /* silent */ }
                    finally { setExporting(false); }
                  }}
                  disabled={exporting}
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {exporting ? "Esportazione..." : "Esporta i miei dati"}
                </button>
                <button
                  onClick={() => setShowDeleteSection(!showDeleteSection)}
                  className="px-4 py-2 text-sm font-medium text-error border border-error rounded-lg hover:bg-error/5 transition-colors"
                >
                  Elimina account
                </button>
              </div>

              {showDeleteSection && (
                <div className="mt-4 p-4 bg-error/5 border border-error/20 rounded-lg space-y-3">
                  <p className="text-sm text-error font-medium">
                    Attenzione: questa azione e irreversibile. Tutti i tuoi dati, immobili, messaggi e documenti saranno eliminati permanentemente.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-error mb-1">Password</label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Inserisci la tua password"
                      className="w-full px-4 py-2.5 border border-error/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-error/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-error mb-1">
                      Scrivi &quot;ELIMINA IL MIO ACCOUNT&quot; per confermare
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="ELIMINA IL MIO ACCOUNT"
                      className="w-full px-4 py-2.5 border border-error/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-error/30"
                    />
                  </div>
                  {deleteError && <p className="text-sm text-error">{deleteError}</p>}
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      setDeleteError("");
                      try {
                        const res = await fetch("/api/user/delete", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            password: deletePassword,
                            confirmation: deleteConfirm,
                          }),
                        });
                        if (res.ok) {
                          window.location.href = "/";
                        } else {
                          const data = await res.json();
                          setDeleteError(data.error || "Errore");
                        }
                      } catch {
                        setDeleteError("Errore di connessione");
                      } finally {
                        setDeleting(false);
                      }
                    }}
                    disabled={deleting || deleteConfirm !== "ELIMINA IL MIO ACCOUNT" || !deletePassword}
                    className="w-full py-2.5 bg-error text-white rounded-lg font-medium disabled:opacity-50 hover:bg-error/85 transition-colors"
                  >
                    {deleting ? "Eliminazione in corso..." : "Elimina definitivamente il mio account"}
                  </button>
                </div>
              )}
            </div>

            {/* Password change */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">Cambia Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Password attuale</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Nuova password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Conferma nuova password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-error mt-1">Le password non coincidono.</p>
                  )}
                </div>
                {pwError && <p className="text-sm text-error">{pwError}</p>}
                {pwMsg && <p className="text-sm text-success font-medium">{pwMsg}</p>}
                <button
                  onClick={handleChangePassword}
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 8 ||
                    changingPw
                  }
                  className="px-6 py-2.5 bg-primary-dark text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors"
                >
                  {changingPw ? "Aggiornamento..." : "Aggiorna password"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
