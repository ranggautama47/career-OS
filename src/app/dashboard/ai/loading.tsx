// src/app/dashboard/ai/loading.tsx
export default function AiLoading() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-pulse">
      <div className="h-7 w-32 bg-slate-800 rounded mb-2" />
      <div className="h-4 w-56 bg-slate-800/60 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-800 bg-slate-800/30 h-64"
          />
        ))}
      </div>
    </div>
  );
}
