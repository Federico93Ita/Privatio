export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0e8ff1]/20 border-t-[#0e8ff1] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#64748b] text-sm">Caricamento dashboard...</p>
      </div>
    </div>
  );
}
