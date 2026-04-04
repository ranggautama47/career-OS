// src/app/dashboard/tasks/loading.tsx
export default function TasksLoading() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-7 w-40 bg-slate-800 rounded mb-2" />
          <div className="h-4 w-60 bg-slate-800/60 rounded" />
        </div>
        <div className="h-10 w-28 bg-slate-800 rounded-xl" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-8 w-24 bg-slate-800 rounded-lg" />
        ))}
      </div>

      {/* Task list skeleton */}
      <div className="space-y-2 max-w-2xl">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-800/30 h-20" />
        ))}
      </div>
    </div>
  );
}