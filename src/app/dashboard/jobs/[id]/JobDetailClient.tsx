"use client";

// src/app/dashboard/jobs/[id]/JobDetailClient.tsx
// Job Detail: info HRD, progress log, AI motivasi berdasarkan status

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Briefcase, ExternalLink, Mail, Instagram, Linkedin,
  Plus, Trash2, Sparkles, User, DollarSign, Calendar, Edit2, Check, X,
  MessageSquare, Clock,
} from "lucide-react";
import { updateJobApplication, updateJobStatus, deleteJobApplication, addJobLog, deleteJobLog } from "@/actions/job-actions";
import { JobStatus } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────────────

type JobLog = { id: string; content: string; date: Date | null; createdAt: Date | null };

type Job = {
  id: string; company: string; position: string; platform: string;
  link?: string | null; status: JobStatus;
  appliedDate: Date; followUpDate?: Date | null; notes?: string | null;
  hrdName?: string | null; hrdEmail?: string | null;
  hrdInstagram?: string | null; hrdLinkedin?: string | null;
  salaryMin?: number | null; salaryMax?: number | null;
  logs: JobLog[];
};

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CFG: Record<JobStatus, { label: string; text: string; bg: string; border: string; dot: string; emoji: string }> = {
  APPLIED:   { label: "Applied",   emoji: "📨", text: "text-indigo-300",  bg: "bg-indigo-500/15",  border: "border-indigo-500/30",  dot: "bg-indigo-400"  },
  INTERVIEW: { label: "Interview", emoji: "🎯", text: "text-amber-300",   bg: "bg-amber-500/15",   border: "border-amber-500/30",   dot: "bg-amber-400"   },
  OFFER:     { label: "Offer 🎉",  emoji: "🎉", text: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  REJECTED:  { label: "Rejected",  emoji: "😔", text: "text-red-300",     bg: "bg-red-500/15",     border: "border-red-500/30",     dot: "bg-red-400"     },
  GHOSTED:   { label: "Ghosted",   emoji: "👻", text: "text-slate-400",   bg: "bg-slate-700/40",   border: "border-slate-600/40",   dot: "bg-slate-500"   },
};
const STATUS_KEYS = Object.keys(STATUS_CFG) as JobStatus[];

// ── Offline fallback — 5 variasi per status, dipakai jika network error total ──
const OFFLINE_MSG: Record<JobStatus, string[]> = {
  APPLIED: [
    "📨 Langkah pertama sudah diambil! Tetap produktif sambil menunggu dan follow up setelah 1 minggu.",
    "📨 Lamaran terkirim — sekarang manfaatkan waktu untuk riset lebih dalam tentang perusahaan itu!",
    "📨 Setiap lamaran adalah investasi masa depan. Jangan berhenti, terus apply ke tempat lain juga!",
    "📨 Good job! Coba follow up via LinkedIn atau email HRD setelah 5-7 hari untuk tunjukkan antusiasme.",
    "📨 Perjalananmu sudah dimulai! Gunakan waktu tunggu untuk latihan interview dan perkuat skill.",
  ],
  INTERVIEW: [
    "🎯 Interview adalah kesempatan emas! Siapkan 3 pertanyaan cerdas dan latihan STAR method malam ini.",
    "🎯 CV kamu sudah menarik perhatian mereka — sekarang tunjukkan kepribadian terbaikmu!",
    "🎯 Deg-degan wajar, tapi mereka juga ingin kamu berhasil! Tidur cukup dan datang 10 menit lebih awal.",
    "🎯 Kepercayaan diri tumbuh dari persiapan. Review pengalaman terbaikmu yang relevan dengan posisi ini.",
    "🎯 Research mendalam tentang perusahaan akan membedakanmu dari kandidat lain. Semangat!",
  ],
  OFFER: [
    "🎉 Selamat! Jangan langsung setuju — minta waktu review dan berani negosiasi gaji!",
    "🎉 Offer di tangan! Pastikan kamu paham semua benefit dan ekspektasi sebelum tanda tangan.",
    "🎉 Mulai negosiasi dengan: 'Berdasarkan riset pasar dan pengalaman saya...' — pembuka yang kuat!",
    "🎉 Multiple offer? Bandingkan growth opportunity, culture, dan benefit jangka panjang juga ya!",
    "🎉 Mereka sudah memilihmu — posisi tawarmu kuat! Gunakan untuk negosiasi dengan percaya diri.",
  ],
  REJECTED: [
    "😔 Rejection bukan tentang siapa kamu. Minta feedback untuk pelajaran berharga lamaran berikutnya!",
    "😔 Banyak orang sukses ditolak puluhan kali sebelum berhasil. Istirahat, lalu bangkit lebih kuat!",
    "😔 Rejection = redirection. Ada tempat yang lebih cocok menunggumu di luar sana!",
    "😔 Jadikan ini data: skills apa yang perlu ditingkatkan? Setiap rejection adalah pelajaran berharga.",
    "😔 Yang membedakan orang sukses adalah mereka tidak berhenti. Kamu masih dalam proses, terus maju!",
  ],
  GHOSTED: [
    "👻 Kirim satu follow-up email sopan, lalu fokus ke peluang lain yang lebih menjanjikan!",
    "👻 Perusahaan dengan komunikasi buruk mungkin memang bukan tempat terbaikmu. Move on!",
    "👻 Coba follow up sekali via LinkedIn. Kalau 3 hari diam, tandai closed dan lanjut ke next!",
    "👻 Tutup bab ini dan alihkan energi ke 3 lamaran baru hari ini — quantity matters!",
    "👻 Keep applying, keep networking — rezekimu ada di tempat yang tepat, bukan di sini!",
  ],
};

function getOfflineMsg(status: JobStatus): string {
  const msgs = OFFLINE_MSG[status] ?? OFFLINE_MSG["APPLIED"];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// ── Editable field ─────────────────────────────────────────────────────────

function EditableField({
  label, value, placeholder, icon: Icon, onSave, type = "text",
}: {
  label: string; value: string; placeholder: string;
  icon: React.ElementType; onSave: (v: string) => Promise<void>; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);
  const [saving, setSaving]   = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave(val);
    setSaving(false);
    setEditing(false);
  };

  const cancel = () => { setVal(value); setEditing(false); };

  return (
    <div className="group">
      <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
        <Icon size={11} />
        {label}
      </label>
      {editing ? (
        <div className="flex gap-2 items-center">
          <input
            type={type}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
            className="flex-1 bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
          />
          <button onClick={save} disabled={saving}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
            <Check size={13} />
          </button>
          <button onClick={cancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className={`text-sm ${val ? "text-slate-200" : "text-slate-600 italic"}`}>
            {val || placeholder}
          </span>
          <button onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all">
            <Edit2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── AI Motivasi ────────────────────────────────────────────────────────────

function AiMotivation({ status, company, position }: { status: JobStatus; company: string; position: string }) {
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("");

  const cfg = STATUS_CFG[status];

  // Cache key unik per kombinasi status+company+position
  const cacheKey = `motivate:${status}:${company}:${position}`;

  const generate = useCallback(async (forceRefresh = false) => {
    // Cek sessionStorage cache dulu (berlaku selama tab terbuka)
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { message: string; model: string };
          setMessage(parsed.message);
          setModelUsed(parsed.model);
          return; // pakai cache, tidak hit API
        }
      } catch { /* sessionStorage tidak tersedia (SSR) */ }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/motivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, company, position }),
      });
      const data = await res.json() as { message: string; model?: string };
      const model = data.model ?? "static";
      setMessage(data.message);
      setModelUsed(model);

      // Simpan ke sessionStorage (cache per tab, hilang saat tab ditutup)
      // Hanya cache jika dapat dari AI (bukan static) untuk hemat quota
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ message: data.message, model }));
      } catch { /* ignore */ }
    } catch {
      // Network error total → pakai offline fallback
      const fallback = getOfflineMsg(status);
      setMessage(fallback);
      setModelUsed("offline");
    } finally {
      setLoading(false);
    }
  }, [status, company, position, cacheKey]);

  // Auto-generate saat pertama load
  useEffect(() => { void generate(false); }, [generate]);

  // Badge warna berdasarkan model
  const modelBadge = () => {
    if (!modelUsed || loading) return null;
    const badges: Record<string, { label: string; cls: string }> = {
      "gemini-2.0-flash": { label: "2.0 Flash",  cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
      "gemini-1.5-flash": { label: "1.5 Flash",  cls: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
      "static":           { label: "static",     cls: "bg-slate-700/60 text-slate-500 border-slate-600/30"    },
      "offline":          { label: "offline",    cls: "bg-slate-700/60 text-slate-500 border-slate-600/30"    },
    };
    const b = badges[modelUsed];
    if (!b) return null;
    return (
      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${b.cls}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className={cfg.text} />
          <span className={`text-xs font-semibold ${cfg.text}`}>AI Motivasi</span>
          {modelBadge()}
        </div>
        <button onClick={() => generate(true)} disabled={loading}
          className={`text-xs px-2 py-1 rounded-lg transition-colors ${cfg.bg} ${cfg.text} hover:opacity-80 disabled:opacity-40`}>
          {loading ? "..." : "↺"}
        </button>
      </div>
      {loading ? (
        <div className="flex gap-1 py-1">
          {[0,1,2].map(i => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-bounce`}
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : (
        <p className="text-slate-200 text-sm leading-relaxed">{message}</p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function JobDetailClient({ job: initialJob, userId }: { job: Job; userId: string }) {
  const router = useRouter();
  const [job, setJob]                 = useState(initialJob);
  const [logs, setLogs]               = useState<JobLog[]>(initialJob.logs);
  const [logInput, setLogInput]       = useState("");
  const [addingLog, startLogTrans]    = useTransition();
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  // ── Save HRD field ───────────────────────────────────────────────────────
  const saveField = (field: string) => async (value: string) => {
    await updateJobApplication(userId, job.id, { [field]: value || undefined });
    setJob((prev) => ({ ...prev, [field]: value || null }));
  };

  // ── Change status ────────────────────────────────────────────────────────
  const changeStatus = (s: JobStatus) => {
    startTransition(async () => {
      const r = await updateJobStatus(userId, job.id, s);
      if (r.success) setJob((p) => ({ ...p, status: s }));
    });
  };

  // ── Add log ──────────────────────────────────────────────────────────────
  const handleAddLog = () => {
    if (!logInput.trim()) return;
    const text = logInput.trim();
    setLogInput("");
    startLogTrans(async () => {
      const r = await addJobLog(userId, job.id, text);
      if (r.success) {
        setLogs((p) => [{ id: r.data.id, content: text, date: new Date(), createdAt: new Date() }, ...p]);
      }
    });
  };

  // ── Delete log ───────────────────────────────────────────────────────────
  const handleDeleteLog = (logId: string) => {
    setDeletingId(logId);
    startTransition(async () => {
      const r = await deleteJobLog(userId, logId);
      if (r.success) setLogs((p) => p.filter((l) => l.id !== logId));
      setDeletingId(null);
    });
  };

  // ── Delete job ───────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!confirm(`Hapus lamaran ke ${job.company}?`)) return;
    startTransition(async () => {
      const r = await deleteJobApplication(userId, job.id);
      if (r.success) router.push("/dashboard/jobs");
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Back button */}
      <button onClick={() => router.push("/dashboard/jobs")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-200 text-sm mb-6 transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Job Tracker
      </button>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header card */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {job.company[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-white text-xl font-bold leading-tight">{job.company}</h1>
                  <p className="text-slate-400 text-sm mt-0.5">{job.position}</p>
                  <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                    <Briefcase size={10} /> {job.platform}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {job.link && (
                  <a href={job.link} target="_blank" rel="noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-700 border border-slate-600 text-slate-400 hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </a>
                )}
                <button onClick={handleDelete} disabled={isPending}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-500/15 text-slate-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="flex gap-4 mb-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                Applied {new Date(job.appliedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            {/* AI Motivasi */}
            <AiMotivation status={job.status} company={job.company} position={job.position} />
          </div>

          {/* Progress Log */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-violet-400" />
              <h2 className="text-slate-100 font-semibold text-sm">Progress Log</h2>
              <span className="text-xs text-slate-600 ml-auto">{logs.length} catatan</span>
            </div>

            {/* Add log */}
            <div className="mb-4">
              <textarea
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddLog(); }}
                placeholder="Tulis update... (Ctrl+Enter untuk simpan)"
                rows={2}
                className="w-full bg-slate-700/40 border border-slate-600/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 resize-none transition-all"
              />
              <button onClick={handleAddLog} disabled={addingLog || !logInput.trim()}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors">
                <Plus size={12} />
                {addingLog ? "Menyimpan..." : "Tambah Log"}
              </button>
            </div>

            {/* Log list */}
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-sm">
                Belum ada progress log. Tambahkan catatan pertama!
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id}
                    className={`group flex gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/30 transition-opacity ${deletingId === log.id ? "opacity-40" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm leading-relaxed">{log.content}</p>
                      <p className="text-slate-600 text-xs mt-1.5 flex items-center gap-1">
                        <Clock size={9} />
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteLog(log.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          {/* Status */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Status</h3>
            <div className="space-y-1.5">
              {STATUS_KEYS.map((s) => {
                const c = STATUS_CFG[s];
                const active = job.status === s;
                return (
                  <button key={s} onClick={() => changeStatus(s)} disabled={isPending}
                    className={[
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
                      active ? `${c.bg} ${c.text} ${c.border}` : "text-slate-500 hover:text-slate-200 hover:bg-slate-700/40 border-transparent",
                    ].join(" ")}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                    <span>{c.emoji} {c.label}</span>
                    {active && <Check size={12} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info HRD */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Info HRD / Recruiter</h3>
            <div className="space-y-4">
              <EditableField
                label="Nama HRD" value={job.hrdName ?? ""} placeholder="Belum diisi"
                icon={User} onSave={saveField("hrdName")}
              />
              <EditableField
                label="Email HRD" value={job.hrdEmail ?? ""} placeholder="Belum diisi"
                icon={Mail} onSave={saveField("hrdEmail")} type="email"
              />
              <EditableField
                label="Instagram HRD" value={job.hrdInstagram ?? ""} placeholder="@username"
                icon={Instagram} onSave={saveField("hrdInstagram")}
              />
              <EditableField
                label="LinkedIn HRD" value={job.hrdLinkedin ?? ""} placeholder="linkedin.com/in/..."
                icon={Linkedin} onSave={saveField("hrdLinkedin")}
              />
            </div>

            {/* Quick contact buttons */}
            {(job.hrdEmail || job.hrdLinkedin || job.hrdInstagram) && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-2">
                {job.hrdEmail && (
                  <a href={`mailto:${job.hrdEmail}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs hover:bg-indigo-500/20 transition-colors">
                    <Mail size={11} /> Email
                  </a>
                )}
                {job.hrdLinkedin && (
                  <a href={job.hrdLinkedin.startsWith("http") ? job.hrdLinkedin : `https://${job.hrdLinkedin}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs hover:bg-blue-500/20 transition-colors">
                    <Linkedin size={11} /> LinkedIn
                  </a>
                )}
                {job.hrdInstagram && (
                  <a href={`https://instagram.com/${job.hrdInstagram.replace("@", "")}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs hover:bg-pink-500/20 transition-colors">
                    <Instagram size={11} /> Instagram
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Estimasi Gaji */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Estimasi Gaji</h3>
            <div className="space-y-4">
              <EditableField
                label="Gaji Minimum (Rp)" value={job.salaryMin?.toString() ?? ""} placeholder="e.g. 5000000"
                icon={DollarSign}
                onSave={async (v) => {
                  await saveField("salaryMin")(v);
                  setJob(p => ({ ...p, salaryMin: v ? parseInt(v) : null }));
                }}
                type="number"
              />
              <EditableField
                label="Gaji Maximum (Rp)" value={job.salaryMax?.toString() ?? ""} placeholder="e.g. 8000000"
                icon={DollarSign}
                onSave={async (v) => {
                  await saveField("salaryMax")(v);
                  setJob(p => ({ ...p, salaryMax: v ? parseInt(v) : null }));
                }}
                type="number"
              />
              {job.salaryMin && job.salaryMax && (
                <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs font-medium text-center">
                  Rp {job.salaryMin.toLocaleString("id-ID")} – {job.salaryMax.toLocaleString("id-ID")}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}