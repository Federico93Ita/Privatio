/**
 * Billing gate — decide se un'agenzia ha accesso alle feature premium
 * (matchmaking, vista lead, assegnazioni) in base allo stato di fatturazione.
 *
 * Usato da:
 *  - src/lib/matchmaking.ts  (escludere agenzie non ACTIVE dal ranking)
 *  - route/server action della dashboard agenzia
 *  - BillingBanner sul layout agenzia
 */

import { prisma } from "@/lib/prisma";
import type { BillingStatus } from "@prisma/client";

export type GateReason =
  | "OK"
  | "NO_AGENCY"
  | "NO_SUBSCRIPTION"
  | "PAST_DUE"
  | "UNPAID"
  | "CANCELED";

export interface GateResult {
  allowed: boolean;
  readOnly: boolean;
  reason: GateReason;
  billingStatus: BillingStatus | null;
}

/**
 * Risultato: allowed=true significa che l'agenzia può ricevere nuovi
 * immobili e operare normalmente. readOnly=true consente la lettura
 * dei dati già assegnati ma blocca nuove assegnazioni / azioni.
 */
export async function getAgencyBillingGate(
  agencyId: string
): Promise<GateResult> {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { id: true, isActive: true, billingStatus: true, stripeSubId: true },
  });

  if (!agency) {
    return {
      allowed: false,
      readOnly: false,
      reason: "NO_AGENCY",
      billingStatus: null,
    };
  }

  // Nessuna subscription mai attivata
  if (!agency.stripeSubId) {
    return {
      allowed: false,
      readOnly: false,
      reason: "NO_SUBSCRIPTION",
      billingStatus: agency.billingStatus,
    };
  }

  switch (agency.billingStatus) {
    case "ACTIVE":
      return {
        allowed: true,
        readOnly: false,
        reason: "OK",
        billingStatus: "ACTIVE",
      };
    case "PAST_DUE":
      // Grace: vede i dati esistenti ma niente nuove assegnazioni.
      return {
        allowed: false,
        readOnly: true,
        reason: "PAST_DUE",
        billingStatus: "PAST_DUE",
      };
    case "UNPAID":
      return {
        allowed: false,
        readOnly: false,
        reason: "UNPAID",
        billingStatus: "UNPAID",
      };
    case "CANCELED":
      return {
        allowed: false,
        readOnly: false,
        reason: "CANCELED",
        billingStatus: "CANCELED",
      };
  }
}

/**
 * Assertion helper per route/server action: lancia un Error 402
 * se l'agenzia non può operare.
 */
export async function assertAgencyActive(agencyId: string): Promise<GateResult> {
  const gate = await getAgencyBillingGate(agencyId);
  if (!gate.allowed) {
    const err = new Error(`Billing gate: ${gate.reason}`);
    (err as Error & { status?: number }).status = 402;
    throw err;
  }
  return gate;
}
