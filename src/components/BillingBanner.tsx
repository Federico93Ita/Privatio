/**
 * BillingBanner — avviso server component mostrato in cima alla dashboard
 * agenzia quando lo stato di fatturazione richiede attenzione.
 *
 * PAST_DUE  → banner giallo, CTA aggiorna metodo di pagamento.
 * UNPAID    → banner rosso, blocco implicito (feature gating lato server).
 * CANCELED  → banner neutro con invito a riattivare.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAgencyBillingGate } from "@/lib/billing-gate";
import BillingPortalButton from "@/components/BillingPortalButton";

export default async function BillingBanner(): Promise<React.ReactElement | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { agencyId: true },
  });
  if (!user?.agencyId) return null;

  const gate = await getAgencyBillingGate(user.agencyId);
  if (gate.allowed) return null;
  if (gate.reason === "NO_AGENCY" || gate.reason === "NO_SUBSCRIPTION")
    return null;

  const palettes = {
    PAST_DUE: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-900",
      title: "Pagamento in sospeso",
      body: "Il tuo abbonamento è past due. Aggiorna il metodo di pagamento per evitare la sospensione dei territori.",
    },
    UNPAID: {
      bg: "bg-red-50",
      border: "border-red-300",
      text: "text-red-900",
      title: "Abbonamento sospeso",
      body: "Il pagamento non è andato a buon fine e i tuoi territori sono stati sospesi. Aggiorna il metodo di pagamento per riattivarli.",
    },
    CANCELED: {
      bg: "bg-slate-50",
      border: "border-slate-300",
      text: "text-slate-900",
      title: "Abbonamento disattivato",
      body: "Il tuo abbonamento è stato disattivato. Riattivalo dalla pagina fatturazione.",
    },
  } as const;

  const key = gate.reason as keyof typeof palettes;
  const p = palettes[key];
  if (!p) return null;

  return (
    <div
      className={`mx-auto max-w-6xl px-4 pt-4`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex flex-col gap-3 rounded-lg border ${p.border} ${p.bg} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className={p.text}>
          <p className="text-sm font-semibold">{p.title}</p>
          <p className="text-xs opacity-90">{p.body}</p>
        </div>
        <BillingPortalButton
          className={`shrink-0 rounded-md border ${p.border} bg-white px-3 py-2 text-xs font-medium ${p.text} hover:bg-white/80`}
          label="Aggiorna metodo di pagamento"
        />
      </div>
    </div>
  );
}
