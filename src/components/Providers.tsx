"use client";

import { SessionProvider } from "next-auth/react";
import CookieBanner from "./CookieBanner";
import GoogleAnalytics from "./GoogleAnalytics";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <CookieBanner />
      <GoogleAnalytics />
    </SessionProvider>
  );
}
