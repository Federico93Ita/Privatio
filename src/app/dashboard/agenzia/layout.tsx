import BillingBanner from "@/components/BillingBanner";

export default function AgencyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      {/* Banner stato fatturazione (PAST_DUE / UNPAID / CANCELED) */}
      <BillingBanner />
      {children}
    </>
  );
}
