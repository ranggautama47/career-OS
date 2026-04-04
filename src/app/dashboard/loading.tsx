// src/app/dashboard/loading.tsx
// Otomatis tampil saat server component sedang fetch data
// Next.js App Router akan render ini LANGSUNG, tanpa tunggu server selesai

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-3 w-24 bg-slate-800 rounded mb-2" />
        <div className="h-8 w-64 bg-slate-800 rounded mb-2" />
        <div className="h-4 w-80 bg-slate-800/60 rounded" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-800/30 p-5 h-32" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-800/30 h-64" />
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-800/30 h-28" />
          <div className="rounded-2xl border border-slate-800 bg-slate-800/30 h-32" />
        </div>
      </div>
    </div>
  );
}