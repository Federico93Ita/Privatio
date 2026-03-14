"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AgencyDocumentsPage() {
  return (
    <DashboardLayout role="agency">
      <div className="space-y-6">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Documenti e Contratti</h1>
        <div className="bg-white rounded-xl p-8 border border-border text-center">
          <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-primary-dark mb-2">Nessun documento</h3>
          <p className="text-text-muted">
            I documenti e le autorizzazioni relative ai tuoi lead appariranno qui.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
