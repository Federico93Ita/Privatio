import type { EmailCategory } from "@prisma/client";

/** Nomi di tutti i template email del sistema */
export type TemplateName =
  // Auth / Account
  | "emailVerification"
  | "welcome"
  | "passwordReset"
  | "otpCode"
  // Venditore
  | "sellerWelcome"
  | "agencyAssigned"
  | "sellerFallbackNotification"
  | "agencyReminder24h"
  // Agenzia
  | "agencyWelcome"
  | "agencyApproved"
  | "agencyRejected"
  | "agencyNewAssignment"
  | "agencyFallbackNotification"
  | "territoryActivated"
  | "subscriptionCanceled"
  | "paymentFailed"
  | "subscriptionRenewed"
  | "subscriptionExpiring"
  | "newZoneAdded"
  // Visite
  | "visitScheduled"
  | "visitBookedAgency"
  | "visitBookedBuyer"
  | "visitStatusUpdate"
  // Lead
  | "leadReceived"
  | "buyerLeadAgencyNotification"
  | "buyerLeadConfirmation"
  | "agencyLeadConfirmation"
  // Contatto / Reclami
  | "contactConfirmation"
  | "complaintConfirmation"
  // Contratti
  | "contractSigned"
  // Ricerche salvate
  | "savedSearchAlert"
  // Admin
  | "adminUserRegistration"
  | "adminAgencyRegistration"
  | "adminNewLead"
  | "adminComplaint"
  | "adminContact"
  | "adminNoZoneFound"
  | "adminNoAgencyAvailable"
  | "adminPropertyUnassigned48h"
  | "weeklyAgencyReport";

/** Risultato di una funzione template */
export interface EmailTemplate {
  subject: string;
  html: string;
  templateName: TemplateName;
  category: EmailCategory;
}

/** Opzioni per sendEmail — backward compatible con la vecchia firma */
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
  templateName?: TemplateName;
  category?: EmailCategory;
  metadata?: Record<string, unknown>;
}

/** Risultato di sendEmail */
export interface SendEmailResult {
  success: boolean;
  data?: { id: string };
  error?: unknown;
}
