/**
 * GA4 event tracking helpers.
 *
 * These only fire when the user has given analytics consent
 * (Google Analytics script loaded via GoogleAnalytics component).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function track(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

/** Fired when a user views a property detail page */
export function trackPropertyView(slug: string, city: string, price: number) {
  track("property_view", { slug, city, price, currency: "EUR" });
}

/** Fired when a buyer submits a contact form (lead) */
export function trackLeadSubmit(propertySlug: string, source: string) {
  track("lead_submit", { property_slug: propertySlug, source });
}

/** Fired when a user contacts an agency */
export function trackAgencyContact(agencyId: string, propertySlug: string) {
  track("agency_contact", { agency_id: agencyId, property_slug: propertySlug });
}

/** Fired when a user saves a property as favorite */
export function trackFavorite(propertySlug: string) {
  track("add_to_favorites", { property_slug: propertySlug });
}

/** Fired when a user saves a search */
export function trackSaveSearch(filters: string) {
  track("save_search", { filters });
}

/** Fired when a seller publishes a property */
export function trackPropertyPublish(slug: string, city: string) {
  track("property_publish", { slug, city });
}

/** Fired when a user registers */
export function trackRegistration(role: string) {
  track("sign_up", { method: "email", role });
}
