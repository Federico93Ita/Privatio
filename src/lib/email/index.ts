/**
 * Modulo Email Privatio
 *
 * Re-export backward compatible: tutte le import da "@/lib/email"
 * continuano a funzionare senza modifiche.
 */

// Client con retry + EmailLog
export { sendEmail, BILLING_FROM } from "./client";

// Helpers
export { esc, legalFooter, formatCurrency, formatDate } from "./helpers";

// Tipi
export type {
  TemplateName,
  EmailTemplate,
  SendEmailOptions,
  SendEmailResult,
} from "./types";

// Costanti
export { BRAND, APP_URL, FONT_FAMILY, MAX_WIDTH } from "./constants";

// Template — registry centralizzato
export {
  // Auth
  emailVerificationEmail,
  welcomeEmail,
  passwordResetEmail,
  otpCodeEmail,
  // Venditore
  sellerWelcomeEmail,
  agencyAssignedEmail,
  agencyReminder24hEmail,
  // Agenzia
  agencyWelcomeEmail,
  agencyApprovedEmail,
  agencyRejectedEmail,
  agencyNewAssignmentEmail,
  agencyLeadConfirmationEmail,
  // Billing
  territoryActivatedEmail,
  subscriptionCanceledEmail,
  paymentFailedEmail,
  subscriptionRenewedEmail,
  // Visite
  visitScheduledEmail,
  visitBookedAgencyEmail,
  visitBookedBuyerEmail,
  visitStatusUpdateEmail,
  // Lead
  leadReceivedEmail,
  buyerLeadAgencyNotificationEmail,
  buyerLeadConfirmationEmail,
  // Contatto / Reclami
  contactConfirmationEmail,
  complaintConfirmationEmail,
  // Contratti
  contractSignedEmail,
  // Matchmaking / Fallback
  agencyFallbackNotificationEmail,
  sellerFallbackNotificationEmail,
  // Ricerche salvate
  savedSearchAlertEmail,
  // Admin
  adminUserRegistrationEmail,
  adminAgencyRegistrationEmail,
  adminContactEmail,
  adminComplaintEmail,
  adminNewLeadEmail,
  adminNoZoneFoundEmail,
  adminNoAgencyAvailableEmail,
} from "./templates";
