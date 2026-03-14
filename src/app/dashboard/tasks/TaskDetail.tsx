"use client";

import { useState, useTransition } from "react";
import {
  ArrowLeft, Clock, Calendar, Hash, FileText,
  CheckCircle2, Circle, MessageSquare, Plus, Trash2,
  ExternalLink , Image as ImageIcon, File as FileIcon,
  Send, BookOpen, Layout, Briefcase, User, Rocket,
  Bell, AlertTriangle, TrendingUp,
} from "lucide-react";
import { Priority, TaskStatus, TaskCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTaskLog, addChecklistItem, toggleChecklistItem, deleteChecklistItem } from "@/actions/task-actions";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskLog {
  id: string;
  date: Date;
  content: string;
  lectureNumber?: number | null;
  createdAt: Date;
}

interface TaskAttachment {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
}

interface TaskChecklist {
  id: string;
  title: string;
  done: boolean;
}

interface TaskDetailData {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  deadline: Date | null;
  estimatedDays: number | null;
  isGroupProject: boolean;
  checklist: TaskChecklist[];
  attachments: TaskAttachment[];
  logs: TaskLog[];
  jobApplication: {
    id: string;
    company: string;
    position: string;
  } | null;
}

// ─── Icon component type (fixes no-explicit-any) ──────────────────────────────

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_MAP: Record<Priority, { label: string; color: string; bg: string }> = {
  LOW:    { label: "Low",    color: "text-slate-400", bg: "bg-slate-500/10" },
  MEDIUM: { label: "Medium", color: "text-blue-400",  bg: "bg-blue-500/10"  },
  HIGH:   { label: "High",   color: "text-amber-400", bg: "bg-amber-500/10" },
  URGENT: { label: "Urgent", color: "text-red-400",   bg: "bg-red-500/10"   },
};

const CATEGORY_ICONS: Record<TaskCategory, IconComponent> = {
  JOB:      Briefcase,
  LEARNING: BookOpen,
  PERSONAL: User,
  PROJECT:  Rocket,
};

const STATUS_LABELS: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  TODO:   { label: "To Do",       color: "text-slate-300",   bg: "bg-slate-700/40"    },
  DOING:  { label: "In Progress", color: "text-blue-300",    bg: "bg-blue-500/10"     },
  REVIEW: { label: "Review",      color: "text-amber-300",   bg: "bg-amber-500/10"    },
  DONE:   { label: "Completed ✓", color: "text-emerald-300", bg: "bg-emerald-500/10"  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysUntilDeadline(deadline: Date | null): number | null {
  if (!deadline) return null;
  const now  = new Date();
  now.setHours(0, 0, 0, 0);
  const d    = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Deadline Reminder Banner ─────────────────────────────────────────────────

function DeadlineBanner({ deadline, status }: { deadline: Date | null; status: TaskStatus }) {
  if (!deadline || status === "DONE") return null;
  const days = getDaysUntilDeadline(deadline);
  if (days === null) return null;

  if (days < 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/15 border border-red-500/35 rounded-2xl mb-6">
        <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-bold text-sm">Deadline Terlewati!</p>
          <p className="text-red-400/80 text-xs">{Math.abs(days)} hari yang lalu — segera selesaikan atau update deadline.</p>
        </div>
      </div>
    );
  }
  if (days === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/15 border border-amber-500/35 rounded-2xl mb-6">
        <Bell size={16} className="text-amber-400 flex-shrink-0 animate-pulse" />
        <div>
          <p className="text-amber-300 font-bold text-sm">⏰ Deadline Hari Ini!</p>
          <p className="text-amber-400/80 text-xs">Task ini harus selesai hari ini. Semangat!</p>
        </div>
      </div>
    );
  }
  if (days <= 3) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl mb-6">
        <Bell size={16} className="text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-amber-300 font-semibold text-sm">Deadline dalam {days} hari</p>
          <p className="text-amber-400/70 text-xs">
            {new Date(deadline).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    );
  }
  if (days <= 7) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-6">
        <Clock size={16} className="text-blue-400 flex-shrink-0" />
        <p className="text-blue-300 text-sm">
          Deadline: <span className="font-semibold">{days} hari lagi</span> —{" "}
          {new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TaskDetail({ task, userId }: { task: TaskDetailData; userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Log entry state
  const [logContent, setLogContent] = useState("");
  const [lectureNum, setLectureNum] = useState("");

  // Checklist state — local mirror untuk optimistic update
  const [checklistItems, setChecklistItems] = useState(task.checklist);
  const [newCheckItem, setNewCheckItem]     = useState("");
  const [checkPending, startCheckTransition] = useTransition();

  // Progress: pakai checklistItems (reaktif) jika ada, fallback ke status
  const progressPercent = (() => {
    if (task.status === "DONE") return 100;
    if (checklistItems.length > 0) {
      return Math.round(checklistItems.filter(c => c.done).length / checklistItems.length * 100);
    }
    if (task.category === "LEARNING" && task.logs.length > 0 && task.estimatedDays) {
      return Math.min(95, Math.round((task.logs.length / task.estimatedDays) * 100));
    }
    const statusMap: Record<TaskStatus, number> = { TODO: 5, DOING: 40, REVIEW: 80, DONE: 100 };
    return statusMap[task.status];
  })();
  const completedChecklist  = checklistItems.filter((c) => c.done).length;
  const CategoryIcon        = CATEGORY_ICONS[task.category];
  const statusCfg           = STATUS_LABELS[task.status];
  const days                = getDaysUntilDeadline(task.deadline);
  const isLearning          = task.category === "LEARNING";

  // Get last log lecture number to show "last studied"
  const lastLog    = task.logs[0]; // logs are ordered desc
  const lastLecture = lastLog?.lectureNumber;

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) return;

    startTransition(async () => {
      const res = await addTaskLog(
        userId,
        task.id,
        logContent.trim(),
        lectureNum ? parseInt(lectureNum) : undefined
      );
      if (res.success) {
        setLogContent("");
        setLectureNum("");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Task Manager
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.color} border border-current/20`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Deadline Reminder Banner */}
      <DeadlineBanner deadline={task.deadline} status={task.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Main Info + Daily Logs ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title Card */}
          <div className="bg-[#111827] rounded-2xl border border-slate-800 p-7 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <CategoryIcon size={18} className="text-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{task.category}</span>
              <div className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="text-xs font-medium text-slate-400">
                {task.jobApplication ? task.jobApplication.company : "Personal"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-5 leading-tight">{task.title}</h1>

            {/* Meta Row */}
            <div className="flex flex-wrap gap-5 mb-7 pb-7 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Clock size={15} className="text-slate-500" />
                <div>
                  <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Status</p>
                  <p className={`text-sm font-semibold ${statusCfg.color}`}>{statusCfg.label}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar size={15} className="text-slate-500" />
                <div>
                  <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Deadline</p>
                  <p className={`text-sm font-semibold ${days !== null && days < 0 ? "text-red-400" : days !== null && days <= 3 ? "text-amber-400" : "text-slate-200"}`}>
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                    {days !== null && task.status !== "DONE" && (
                      <span className="ml-1.5 text-[10px] font-normal text-slate-500">
                        {days < 0 ? `(${Math.abs(days)}h lalu)` : days === 0 ? "(hari ini)" : `(${days}h lagi)`}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${PRIORITY_MAP[task.priority].bg}`}>
                  <Hash size={13} className={PRIORITY_MAP[task.priority].color} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Priority</p>
                  <p className={`text-sm font-bold ${PRIORITY_MAP[task.priority].color}`}>
                    {PRIORITY_MAP[task.priority].label}
                  </p>
                </div>
              </div>

              {isLearning && lastLecture && (
                <div className="flex items-center gap-2.5">
                  <BookOpen size={15} className="text-amber-500" />
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Last Studied</p>
                    <p className="text-sm font-semibold text-amber-300">Lecture {lastLecture}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-5">
              {task.description && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText size={12} className="text-blue-400" /> Description
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Notes — extra notes from edit */}
              {task.notes && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <MessageSquare size={12} className="text-purple-400" /> Extra Notes
                  </h3>
                  <div className="text-slate-300 text-sm leading-relaxed bg-purple-900/10 p-4 rounded-xl border border-purple-500/20 italic">
                    {task.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Daily Progress Logs ── */}
          <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
           <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-700/60 flex-wrap bg-slate-800/70 backdrop-blur">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                <Layout size={16} className="text-emerald-400" />
                Daily Progress Log
              </h3>
              <div className="flex items-center gap-2">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono font-semibold">{task.logs.length} entri</span>
              </div>
            </div>

            <div className="p-5">
              {/* Add New Log */}
              {task.status !== "DONE" && (
                <form onSubmit={handleAddLog} className="mb-7">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                    + Tambah Catatan Hari Ini
                  </p>
                  <div className="flex gap-3">
                    {isLearning && (
                      <div className="w-24 flex-shrink-0">
                        <Input
                          placeholder="Lec #"
                          type="number"
                          value={lectureNum}
                          onChange={(e) => setLectureNum(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-center text-xs h-10"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        placeholder={isLearning ? "Sudah sampai mana hari ini? Hal yang dipelajari / kesulitan..." : "Apa yang kamu kerjakan hari ini?"}
                        value={logContent}
                        onChange={(e) => setLogContent(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-xs h-10"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isPending || !logContent.trim()}
                      className="h-10 px-4 bg-emerald-700 hover:bg-emerald-600 flex-shrink-0"
                    >
                      <Send size={13} />
                    </Button>
                  </div>
                  {isLearning && (
                    <p className="text-[10px] text-slate-600 mt-2">
                      💡 Isi Lec # dengan nomor lecture terakhir yang kamu pelajari hari ini.
                    </p>
                  )}
                </form>
              )}

              {/* Timeline */}
              <div className="space-y-5">
                {task.logs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                      <Plus size={20} className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Belum ada catatan progres</p>
                    <p className="text-slate-600 text-xs">Mulai mencatat aktivitas harianmu di sini!</p>
                  </div>
                ) : (
                  task.logs.map((log, idx) => (
                    <div key={log.id} className="relative pl-9 pb-5 last:pb-0 group">
                      {/* Timeline line */}
                      {idx !== task.logs.length - 1 && (
                        <div className="absolute left-[14px] top-7 bottom-0 w-0.5 bg-slate-800" />
                      )}
                      {/* Dot */}
                      <div className="absolute left-0.5 top-2 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-emerald-500/60 transition-colors z-10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>

                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {task.logs.length - idx === 1 ? "🎉 Pertama" : `Entry #${task.logs.length - idx}`}
                            </span>
                            {log.lectureNumber && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/25">
                                📚 Lecture {log.lectureNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(log.date).toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{log.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Completion message */}
              {task.status === "DONE" && task.logs.length > 0 && (
                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <p className="text-emerald-300 text-sm font-semibold">
                    Task selesai dengan {task.logs.length} catatan progres. Kerja bagus! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Progress + Checklist + Attachments ── */}
        <div className="space-y-5">

          {/* Progress Widget */}
          <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-white font-bold mb-5 flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-amber-500" /> Overall Progress
            </h3>

            {/* Big percentage */}
            <div className="flex items-end gap-2 mb-3">
              <span className="text-5xl font-black text-white tabular-nums leading-none">
                {progressPercent}
              </span>
              <span className="text-lg text-slate-500 font-bold pb-1">%</span>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden mb-5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  progressPercent === 100
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                    : "bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider mb-1">Logs</p>
                <p className="text-lg font-black text-white">{task.logs.length}</p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider mb-1">Done</p>
                <p className="text-lg font-black text-white">{completedChecklist}</p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider mb-1">Items</p>
                <p className="text-lg font-black text-white">{checklistItems.length}</p>
              </div>
            </div>

            {/* ── Checklist (interactive) ── */}
            <div className="space-y-2">
              <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                Checklist
                {checklistItems.length > 0 && (
                  <span className="ml-2 text-slate-500 normal-case font-normal">
                    {checklistItems.filter(c => c.done).length}/{checklistItems.length}
                  </span>
                )}
              </p>

              {/* Progress bar mini */}
              {checklistItems.length > 0 && (
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(checklistItems.filter(c=>c.done).length/checklistItems.length*100)}%` }}
                  />
                </div>
              )}

              {/* Items */}
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group/check">
                  <button
                    onClick={() => {
                      // Optimistic update
                      setChecklistItems(prev => prev.map(c => c.id === item.id ? {...c, done: !c.done} : c));
                      startCheckTransition(async () => {
                        const res = await toggleChecklistItem(userId, task.id, item.id);
                        if (!res.success) {
                          // Rollback jika gagal
                          setChecklistItems(prev => prev.map(c => c.id === item.id ? {...c, done: item.done} : c));
                        }
                      });
                    }}
                    className={`flex-shrink-0 transition-colors ${item.done ? "text-emerald-500 hover:text-emerald-400" : "text-slate-700 hover:text-slate-400"}`}
                  >
                    {item.done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                  </button>
                  <span className={`text-xs flex-1 ${item.done ? "text-slate-500 line-through" : "text-slate-300"}`}>
                    {item.title}
                  </span>
                  <button
                    onClick={() => {
                      setChecklistItems(prev => prev.filter(c => c.id !== item.id));
                      startCheckTransition(async () => {
                        await deleteChecklistItem(userId, task.id, item.id);
                      });
                    }}
                    className="opacity-0 group-hover/check:opacity-100 text-slate-700 hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Add item input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const title = newCheckItem.trim();
                  if (!title) return;
                  const tempId = `temp-${Date.now()}`;
                  // Optimistic update
                  setChecklistItems(prev => [...prev, { id: tempId, title, done: false }]);
                  setNewCheckItem("");
                  startCheckTransition(async () => {
                    const res = await addChecklistItem(userId, task.id, title);
                    if (res.success && res.data) {
                      // Replace temp with real id
                      setChecklistItems(prev => prev.map(c => c.id === tempId ? { ...c, id: res.data!.id } : c));
                    } else {
                      // Rollback
                      setChecklistItems(prev => prev.filter(c => c.id !== tempId));
                    }
                  });
                }}
                className="flex items-center gap-2 mt-1"
              >
                <input
                  type="text"
                  value={newCheckItem}
                  onChange={e => setNewCheckItem(e.target.value)}
                  placeholder="+ Tambah sub-task..."
                  className="flex-1 bg-transparent text-xs text-slate-400 placeholder:text-slate-700 border-b border-slate-800 focus:border-slate-600 focus:outline-none py-1 transition-colors"
                />
                {newCheckItem.trim() && (
                  <button type="submit" disabled={checkPending}
                    className="text-emerald-500 hover:text-emerald-400 transition-colors flex-shrink-0">
                    <Plus size={14} />
                  </button>
                )}
              </form>
            </div>

            {/* Estimated days vs logs progress (for LEARNING) */}
            {isLearning && task.estimatedDays && (
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider mb-2">Est. Duration</p>
                <p className="text-sm text-slate-300">
                  <span className="text-white font-bold">{task.logs.length}</span>
                  <span className="text-slate-500"> / {task.estimatedDays} hari</span>
                </p>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
              <FileIcon size={15} className="text-blue-400" /> Attachments
            </h3>
            <div className="space-y-2">
              {task.attachments.length === 0 ? (
                <div className="text-center py-7 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-600 text-xs">Belum ada file.</p>
                </div>
              ) : (
                task.attachments.map((file) => {
                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-blue-400 transition-colors">
                          {isImg ? <ImageIcon size={13} /> : <FileIcon size={13} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white font-medium truncate max-w-[130px]">{file.name}</p>
                          <p className="text-[9px] text-slate-600 uppercase font-bold tracking-tight">
                            {new Date(file.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink  size={13} />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pro tip */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-blue-900/10 border border-indigo-500/20">
            <h4 className="text-xs font-bold text-indigo-300 mb-1.5">💡 Pro Tip</h4>
            <p className="text-[11px] text-indigo-200/70 leading-relaxed">
              {isLearning
                ? "Catat nomor lecture & hal yang masih kurang dipahami setiap hari. Progres akan terlihat naik otomatis!"
                : "Gunakan Daily Log untuk mencatat kendala, keputusan, dan hal menarik selama mengerjakan task ini."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}