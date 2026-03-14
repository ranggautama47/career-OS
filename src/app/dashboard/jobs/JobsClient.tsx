"use client";

// src/app/dashboard/jobs/JobsClient.tsx

import { useState, useTransition } from "react";
import Link from "next/link";
import { Briefcase, Plus, ExternalLink, Trash2, ChevronDown, Calendar, Search } from "lucide-react";
import { createJobApplication, updateJobStatus, deleteJobApplication } from "@/actions/job-actions";
import type { JobApplicationPayload } from "@/actions/job-actions";
import { JobStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal, ConfirmModal } from "@/components/ui/modal";

type Job = {
  id: string; company: string; position: string; platform: string;
  link?: string | null; status: JobStatus;
  appliedDate: Date; followUpDate?: Date | null; notes?: string | null;
};

const STATUS_KEYS: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "GHOSTED"];

const STATUS_CFG: Record<JobStatus, { label: string; text: string; bg: string; border: string; dot: string }> = {
  APPLIED:   { label: "Applied",   text: "text-indigo-300",  bg: "bg-indigo-500/20",  border: "border-indigo-500/35",  dot: "bg-indigo-400"  },
  INTERVIEW: { label: "Interview", text: "text-amber-300",   bg: "bg-amber-500/20",   border: "border-amber-500/35",   dot: "bg-amber-400"   },
  OFFER:     { label: "Offer 🎉",  text: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/35", dot: "bg-emerald-400" },
  REJECTED:  { label: "Rejected",  text: "text-red-300",     bg: "bg-red-500/20",     border: "border-red-500/35",     dot: "bg-red-400"     },
  GHOSTED:   { label: "Ghosted",   text: "text-slate-400",   bg: "bg-slate-700/40",   border: "border-slate-600/40",   dot: "bg-slate-500"   },
};

const STATUS_OPTIONS = STATUS_KEYS.map((s) => ({ value: s, label: STATUS_CFG[s].label }));

function StatusPill({ status }: { status: JobStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.text} ${c.bg} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function JobCard({ job, userId, onDelete, onStatusChange }: {
  job: Job; userId: string; onDelete: (id: string) => void; onStatusChange: (id: string, s: JobStatus) => void;
}) {
  const [showMenu, setShowMenu]       = useState(false);
  const [confirmDel, setConfirmDel]   = useState(false);
  const [isPending, startTransition]  = useTransition();

  const changeStatus = (s: JobStatus) => {
    setShowMenu(false);
    startTransition(async () => { const r = await updateJobStatus(userId, job.id, s); if (r.success) onStatusChange(job.id, s); });
  };
  const doDelete = () => startTransition(async () => {
    const r = await deleteJobApplication(userId, job.id); if (r.success) onDelete(job.id);
  });

  return (
    <>
      <ConfirmModal open={confirmDel} onClose={() => setConfirmDel(false)} onConfirm={doDelete}
        title="Hapus Lamaran?" message={`Hapus lamaran ke ${job.company}?`} confirmLabel="Hapus" loading={isPending} />

      <div className={[
        "bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 group transition-all duration-150",
        "hover:bg-slate-800/90 hover:border-slate-600/70 hover:-translate-y-0.5",
        isPending ? "opacity-50 pointer-events-none" : "",
      ].join(" ")}>
        {/* Top */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-slate-200 font-bold text-sm flex-shrink-0">
              {job.company[0]}
            </div>
            <div>
              <h3 className="text-slate-100 font-semibold text-sm leading-tight">{job.company}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{job.platform}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {job.link && (
              <a href={job.link} target="_blank" rel="noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-600 text-slate-500 hover:text-slate-200 transition-colors">
                <ExternalLink size={13} />
              </a>
            )}
            <button onClick={() => setConfirmDel(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-300 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p className="text-slate-200 text-sm font-medium mb-3">{job.position}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Status dropdown */}
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-1 group/status">
              <StatusPill status={job.status} />
              <ChevronDown size={11} className="text-slate-600 group-hover/status:text-slate-400 transition-colors ml-0.5" />
            </button>
            {showMenu && (
              <div className="absolute top-full left-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl p-1 z-20 min-w-[150px] shadow-2xl shadow-black/50">
                {STATUS_KEYS.map((s) => (
                  <button key={s} onClick={() => changeStatus(s)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                      ${job.status === s ? `${STATUS_CFG[s].bg} ${STATUS_CFG[s].text}` : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CFG[s].dot}`} />
                    {STATUS_CFG[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-slate-600 text-xs flex items-center gap-1">
            <Calendar size={11} />
            {new Date(job.appliedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </span>
          <Link href={`/dashboard/jobs/${job.id}`}
            className="text-xs text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100">
            Detail →
          </Link>
        </div>
      </div>
    </>
  );
}

function AddJobModal({ userId, onClose, onAdd }: {
  userId: string; onClose: () => void; onAdd: (j: Job) => void;
}) {
  const [form, setForm] = useState({ company: "", position: "", platform: "", link: "", notes: "", status: "APPLIED" as JobStatus });
  const [isPending, startTransition] = useTransition();
  const [error, setError]            = useState("");

  const upd = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const isValidUrl = (url: string) => {
    if (!url) return true; // opsional
    try { const u = new URL(url); return u.protocol === "https:" || u.protocol === "http:"; }
    catch { return false; }
  };

  const handleSubmit = () => {
    setError("");
    if (!form.company || !form.position || !form.platform) { setError("Company, position, dan platform wajib diisi."); return; }
    if (form.link && !isValidUrl(form.link)) { setError("Job Link harus berupa URL valid (contoh: https://linkedin.com/jobs/...)"); return; }
    startTransition(async () => {
      const payload: JobApplicationPayload = {
        company: form.company, position: form.position, platform: form.platform,
        link: form.link || undefined, notes: form.notes || undefined, status: form.status,
      };
      const res = await createJobApplication(userId, payload);
      if (res.success) {
        onAdd({ id: res.data.id, company: form.company, position: form.position, platform: form.platform, link: form.link || null, notes: form.notes || null, status: form.status, appliedDate: new Date(), followUpDate: null });
        onClose();
      } else setError(res.error);
    });
  };

  return (
    <Modal open onClose={onClose} title="Add Job Application" description="Tambahkan lamaran baru ke tracker" size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Batal</Button>
          <Button variant="primary" onClick={handleSubmit} loading={isPending}>Add Application</Button>
        </>
      }
    >
      {error && <div className="mb-4 px-3 py-2.5 bg-red-500/15 border border-red-400/30 rounded-xl text-red-300 text-xs">{error}</div>}
      <div className="space-y-3">
        <Input label="Company *" placeholder="e.g. Google" value={form.company} onChange={upd("company")} />
        <Input label="Position *" placeholder="e.g. Software Engineer" value={form.position} onChange={upd("position")} />
        <Input label="Platform *" placeholder="e.g. LinkedIn, Glints" value={form.platform} onChange={upd("platform")} />
        <div className="flex flex-col gap-1.5">
          <Input
            label="Job Link"
            placeholder="https://linkedin.com/jobs/..."
            value={form.link}
            onChange={upd("link")}
            type="url"
          />
          {form.link && !/^https?:\/\//.test(form.link) && (
            <p className="text-amber-400 text-xs flex items-center gap-1">
              ⚠ URL harus dimulai dengan https:// atau http://
            </p>
          )}
        </div>
        <Select label="Status Awal" options={STATUS_OPTIONS} value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as JobStatus }))} />
        <div className="flex flex-col gap-1.5">
          <label className="text-slate-400 text-xs font-medium">Notes</label>
          <textarea placeholder="Any notes..." value={form.notes} onChange={upd("notes")} rows={2}
            className="w-full bg-white/[0.04] border border-white/8 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500/50 resize-none transition-all" />
        </div>
      </div>
    </Modal>
  );
}

export function JobsClient({ initialJobs, userId }: { initialJobs: Job[]; userId: string }) {
  const [jobs, setJobs]                 = useState<Job[]>(initialJobs);
  const [showModal, setShowModal]       = useState(false);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<JobStatus | "ALL">("ALL");

  const filtered = jobs.filter((j) => {
    const ms = j.company.toLowerCase().includes(search.toLowerCase()) || j.position.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === "ALL" || j.status === filterStatus;
    return ms && mf;
  });

  const counts = STATUS_KEYS.reduce((acc, s) => { acc[s] = jobs.filter((j) => j.status === s).length; return acc; }, {} as Record<JobStatus, number>);

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {showModal && <AddJobModal userId={userId} onClose={() => setShowModal(false)} onAdd={(j) => setJobs((p) => [j, ...p])} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Briefcase size={20} className="text-violet-400" />
            <h1 className="text-white text-2xl font-bold tracking-tight">Job Tracker</h1>
          </div>
          <p className="text-slate-500 text-sm">{jobs.length} lamaran · Track progress dari apply sampai offer.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => setShowModal(true)}
          className="bg-violet-600 hover:bg-violet-500 shadow-violet-500/20">
          Add Application
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setFilterStatus("ALL")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === "ALL" ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}>
          All ({jobs.length})
        </button>
        {STATUS_KEYS.map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s ? `${STATUS_CFG[s].bg} ${STATUS_CFG[s].text} border ${STATUS_CFG[s].border}` : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}>
            {STATUS_CFG[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <Input placeholder="Search company or position..." value={search}
          onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={14} />} />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-violet-400" />
          </div>
          <p className="text-slate-300 font-semibold mb-1">
            {jobs.length === 0 ? "Belum ada job application" : "Tidak ada hasil ditemukan"}
          </p>
          <p className="text-slate-600 text-sm mb-5">
            {jobs.length === 0 ? "Tambahkan lamaran pertama kamu!" : "Coba ubah filter atau kata kunci."}
          </p>
          {jobs.length === 0 && (
            <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => setShowModal(true)}
              className="bg-violet-600 hover:bg-violet-500">Add Application</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} userId={userId}
              onDelete={(id) => setJobs((p) => p.filter((j) => j.id !== id))}
              onStatusChange={(id, s) => setJobs((p) => p.map((j) => j.id === id ? { ...j, status: s } : j))} />
          ))}
        </div>
      )}
    </div>
  );
}