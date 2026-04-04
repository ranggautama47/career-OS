// src/app/dashboard/notes/loading.tsx
export default function NotesLoading() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-7 w-36 bg-slate-800 rounded mb-2" />
          <div className="h-4 w-48 bg-slate-800/60 rounded" />
        </div>
        <div className="h-10 w-28 bg-slate-800 rounded-xl" />
      </div>

      {/* Search skeleton */}
      <div className="h-10 w-full max-w-sm bg-slate-800 rounded-xl mb-6" />

      {/* Notes grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-800/30 h-48" />
        ))}
      </div>
    </div>
  );
}