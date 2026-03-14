"use client";

// src/app/dashboard/tasks/TasksClient.tsx
// Fixed: unused setExistingAttachments, notes textarea in edit modal, Task type includes notes

import { useState, useTransition } from "react";
import {
  CheckSquare, Plus, Trash2, Edit2, Clock,
  Users, Check, AlertTriangle, BookOpen, Eye,
  Download, File as FileIcon,
} from "lucide-react";
import { createTask, updateTask, toggleTaskComplete, deleteTask } from "@/actions/task-actions";
import type { TaskPayload } from "@/actions/task-actions";
import { TaskStatus, Priority, TaskCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal, ConfirmModal } from "@/components/ui/modal";

// ─── Types ────────────────────────────────────────────────────────────────────

type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  description?: string | null;
  notes?: string | null;           // ← included so edit modal loads it
  status: TaskStatus;
  priority: Priority;
  deadline?: Date | null;
  estimatedDays?: number | null;
  isGroupProject: boolean;
  updatedAt: Date;
  tags?: { label: string; color: string }[];
  attachments?: { id: string; url: string; name: string }[];
};

type JobOption = { id: string; company: string; position: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLUMNS: { key: TaskStatus; label: string; accent: string; dimBg: string }[] = [
  { key: "TODO",   label: "To Do",       accent: "text-slate-300",   dimBg: "bg-slate-800/40 border-slate-700/40"      },
  { key: "DOING",  label: "In Progress", accent: "text-blue-300",    dimBg: "bg-blue-900/20 border-blue-800/30"        },
  { key: "REVIEW", label: "Review",      accent: "text-amber-300",   dimBg: "bg-amber-900/20 border-amber-800/30"      },
  { key: "DONE",   label: "Done",        accent: "text-emerald-300", dimBg: "bg-emerald-900/20 border-emerald-800/30"  },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  LOW:    { label: "Low",    color: "text-slate-400", bg: "bg-slate-700/40",  border: "border-slate-600/40"  },
  MEDIUM: { label: "Medium", color: "text-blue-300",  bg: "bg-blue-500/15",   border: "border-blue-500/25"   },
  HIGH:   { label: "High",   color: "text-amber-300", bg: "bg-amber-500/15",  border: "border-amber-500/25"  },
  URGENT: { label: "Urgent", color: "text-red-300",   bg: "bg-red-500/15",    border: "border-red-500/25"    },
};

const PRIORITY_OPTIONS = [
  { value: "LOW",    label: "Low"    },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH",   label: "High"   },
  { value: "URGENT", label: "Urgent" },
];

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; bg: string; border: string }> = {
  JOB:      { label: "💼 Job",      color: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-500/25" },
  LEARNING: { label: "📚 Learning", color: "text-amber-300",  bg: "bg-amber-500/15",  border: "border-amber-500/25"  },
  PERSONAL: { label: "🏠 Personal", color: "text-purple-300", bg: "bg-purple-500/15", border: "border-purple-500/25" },
  PROJECT:  { label: "🚀 Project",  color: "text-blue-300",   bg: "bg-blue-500/15",   border: "border-blue-500/25"   },
};

const LABEL_OPTIONS = ["Urgent", "Learning", "Personal", "Work", "Idea"];

function isOverdue(d?: Date | null) {
  return !!d && new Date(d) < new Date();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityPill({ priority }: { priority: Priority }) {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${c.color} ${c.bg} ${c.border}`}>
      {c.label}
    </span>
  );
}

function CategoryPill({ category }: { category: TaskCategory }) {
  const c = CATEGORY_CONFIG[category];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${c.color} ${c.bg} ${c.border}`}>
      {c.label}
    </span>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({ task, userId, onToggle, onDelete, onEdit }: {
  task: Task;
  userId: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  const [confirm, setConfirm]        = useState(false);
  const [isPending, startTransition] = useTransition();
  const isDone  = task.status === "DONE";
  const overdue = !isDone && isOverdue(task.deadline);

  const handleToggle = () =>
    startTransition(async () => {
      const r = await toggleTaskComplete(userId, task.id);
      if (r.success) onToggle(task.id);
    });

  const handleDelete = () =>
    startTransition(async () => {
      const r = await deleteTask(userId, task.id);
      if (r.success) onDelete(task.id);
    });

  return (
    <>
      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Task?"
        message={`Hapus "${task.title}"?`}
        confirmLabel="Hapus"
        loading={isPending}
      />

      <div className={[
        "rounded-xl border p-4 transition-all duration-150 group",
        isPending ? "opacity-50 pointer-events-none" : "",
        overdue
          ? "bg-red-900/15 border-red-500/25"
          : isDone
          ? "bg-slate-800/30 border-slate-700/30 opacity-60"
          : "bg-slate-800/70 border-slate-700/50 hover:bg-slate-800/90 hover:border-slate-600/70",
      ].join(" ")}>
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            style={{ width: 18, height: 18, flexShrink: 0 }}
            className={`mt-0.5 rounded-md border-2 flex items-center justify-center transition-all
              ${isDone ? "bg-emerald-500 border-emerald-500" : overdue ? "border-red-400 hover:border-red-300" : "border-slate-600 hover:border-indigo-400"}`}
          >
            {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-snug ${isDone ? "text-slate-600 line-through" : overdue ? "text-red-200" : "text-slate-100"}`}>
              {task.title}
            </p>

            {task.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
            )}

            {/* Notes preview */}
            {task.notes && !isDone && (
              <p className="text-[11px] text-purple-400/70 mt-0.5 line-clamp-1 italic">
                📝 {task.notes}
              </p>
            )}

            {/* Pills */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <CategoryPill category={task.category} />
              <PriorityPill priority={task.priority} />
              {task.deadline && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${overdue ? "text-red-300" : isDone ? "text-slate-600" : "text-slate-500"}`}>
                  <Clock size={9} />
                  {overdue && !isDone && "Overdue · "}
                  {new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              )}
              {task.isGroupProject && (
                <span className="inline-flex items-center gap-1 text-[11px] text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded-md font-medium">
                  <Users size={9} /> Group
                </span>
              )}
              {task.estimatedDays && (
                <span className="text-[11px] text-slate-600">{task.estimatedDays}d est.</span>
              )}
            </div>

            {/* Learning Progress Bar */}
            {task.category === "LEARNING" && !isDone && (
              <div className="mt-2.5">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1"><BookOpen size={9} /> Learning Progress</span>
                  <span className="text-amber-400 font-semibold">In Progress</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                    style={{ width: task.status === "DOING" ? "50%" : task.status === "REVIEW" ? "80%" : "10%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons (visible on hover) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={`/dashboard/tasks/${task.id}`}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-300 transition-all"
              title="View Detail"
            >
              <Eye size={12} />
            </a>
            <button
              onClick={() => onEdit(task)}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-500/20 text-slate-500 hover:text-blue-300 transition-all"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => setConfirm(true)}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-300 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── TaskModal (Create + Edit) ────────────────────────────────────────────────

function TaskModal({
  userId, jobs, onClose, onAdd, onUpdate, editingTask,
}: {
  userId: string;
  jobs: JobOption[];
  onClose: () => void;
  onAdd: (t: Task) => void;
  onUpdate: (t: Task) => void;
  editingTask?: Task | null;
}) {
  const isEdit = !!editingTask;

  const [form, setForm] = useState({
    title:            editingTask?.title            ?? "",
    description:      editingTask?.description      ?? "",
    status:           editingTask?.status           ?? ("TODO"     as TaskStatus),
    priority:         editingTask?.priority         ?? ("MEDIUM"   as Priority),
    category:         editingTask?.category         ?? ("PERSONAL" as TaskCategory),
    deadline:         editingTask?.deadline
                        ? new Date(editingTask.deadline).toISOString().split("T")[0]
                        : "",
    estimatedDays:    editingTask?.estimatedDays?.toString() ?? "",
    isGroupProject:   editingTask?.isGroupProject   ?? false,
    jobApplicationId: "",
    // ← notes is properly loaded from editingTask for edit mode
    notes:            editingTask?.notes            ?? "",
  });

  const [file, setFile]                       = useState<File | null>(null);
  const [selectedLabels, setSelectedLabels]   = useState<string[]>(
    editingTask?.tags?.map((t) => t.label) ?? []
  );
  // FIX: removed unused setter — const [x] not const [x, setX]
  const existingAttachments                   = editingTask?.attachments ?? [];
  const [isPending, startTransition]          = useTransition();
  const [error, setError]                     = useState("");

  const upd =
    (f: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));

  const jobOptions = [
    { value: "", label: "— Tanpa Job (Personal / Learning) —" },
    ...jobs.map((j) => ({ value: j.id, label: `${j.company} — ${j.position}` })),
  ];

  const handleSubmit = () => {
    setError("");
    if (!form.title.trim()) { setError("Judul task tidak boleh kosong."); return; }

    startTransition(async () => {
      const payload: TaskPayload = {
        title:          form.title.trim(),
        description:    form.description.trim() || undefined,
        status:         form.status,
        priority:       form.priority,
        category:       form.category,
        deadline:       form.deadline ? new Date(form.deadline) : undefined,
        estimatedDays:  form.estimatedDays ? parseInt(form.estimatedDays) : undefined,
        isGroupProject: form.isGroupProject,
        notes:          form.notes.trim() || undefined,
      };

      // ── EDIT mode ──────────────────────────────────────────────────────────
      if (isEdit && editingTask) {
        const res = await updateTask(userId, editingTask.id, payload);
        if (!res.success) { setError(res.error); return; }

        onUpdate({
          ...editingTask,
          ...payload,
          notes:         payload.notes          ?? null,
          deadline:      payload.deadline        ?? null,
          estimatedDays: payload.estimatedDays   ?? null,
          description:   payload.description     ?? null,
          updatedAt:     new Date(),
        });
        onClose();
        return;
      }

      // ── CREATE mode ────────────────────────────────────────────────────────
      let attachmentUrl: string | null = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up     = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await up.json() as { success: boolean; url?: string };
        if (upData.success && upData.url) attachmentUrl = upData.url;
      }

      const jobId = form.jobApplicationId || undefined;
      const res   = await createTask(userId, jobId, payload);
      if (!res.success) { setError(res.error); return; }

      const taskId = res.data.id;

      // Save labels
      await Promise.all(
        selectedLabels.map((label) =>
          fetch("/api/task-tags", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ taskId, label, color: "gray" }),
          })
        )
      );

      // Save attachment
      if (attachmentUrl) {
        await fetch("/api/task-attachments", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ taskId, url: attachmentUrl, name: file?.name }),
        });
      }

      onAdd({
        id:            taskId,
        title:         form.title.trim(),
        description:   form.description.trim() || null,
        notes:         form.notes.trim() || null,
        category:      form.category,
        status:        form.status,
        priority:      form.priority,
        deadline:      form.deadline ? new Date(form.deadline) : null,
        estimatedDays: form.estimatedDays ? parseInt(form.estimatedDays) : null,
        isGroupProject: form.isGroupProject,
        updatedAt:     new Date(),
      });
      onClose();
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit Task" : "Create New Task"}
      description={isEdit ? "Perbarui detail task kamu." : "Tambahkan task baru ke workspace kamu."}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Batal</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isPending}
            className={isEdit ? "bg-blue-600 hover:bg-blue-500" : "bg-amber-600 hover:bg-amber-500"}
          >
            {isEdit ? "Save Changes" : "Create Task"}
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 px-3 py-2.5 bg-red-500/15 border border-red-400/30 rounded-xl text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Linked Job — only for create */}
        {!isEdit && (
          <Select
            label="Linked Job"
            options={jobOptions}
            value={form.jobApplicationId}
            onChange={(e) => setForm((p) => ({ ...p, jobApplicationId: e.target.value }))}
          />
        )}

        <Input label="Title *" placeholder="What needs to be done?" value={form.title} onChange={upd("title")} required />
        <Input label="Description" placeholder="Describe the task..." value={form.description as string} onChange={upd("description")} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Category"
            options={[
              { value: "JOB",      label: "💼 Job"      },
              { value: "LEARNING", label: "📚 Learning" },
              { value: "PERSONAL", label: "🏠 Personal" },
              { value: "PROJECT",  label: "🚀 Project"  },
            ]}
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as TaskCategory }))}
          />
          <Select
            label="Status"
            options={[
              { value: "TODO",   label: "📝 To Do"       },
              { value: "DOING",  label: "⏳ In Progress" },
              { value: "REVIEW", label: "🔍 Review"      },
              { value: "DONE",   label: "✅ Done"        },
            ]}
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TaskStatus }))}
          />
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Deadline" type="date" value={form.deadline} onChange={upd("deadline")} />
          <Input label="Estimated Days" type="number" placeholder="e.g. 30" value={form.estimatedDays} onChange={upd("estimatedDays")} />
        </div>

        {/* Learning hint */}
        {form.category === "LEARNING" && (
          <div className="px-3 py-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <BookOpen size={12} />
            <span>Task LEARNING menampilkan progress bar. Isi Estimated Days untuk estimasi durasi belajar.</span>
          </div>
        )}

        {/* Labels */}
        <div>
          <p className="text-xs text-slate-400 mb-2 font-medium">Labels</p>
          <div className="flex flex-wrap gap-2">
            {LABEL_OPTIONS.map((label) => {
              const active = selectedLabels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setSelectedLabels((prev) =>
                      active ? prev.filter((l) => l !== label) : [...prev, label]
                    )
                  }
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all
                    ${active ? "bg-indigo-500 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <p className="text-xs text-slate-400 mb-2 font-medium">Attachments</p>
          {existingAttachments.length > 0 && (
            <div className="space-y-2 mb-3">
              {existingAttachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileIcon size={12} className="text-slate-500" />
                    <span className="text-[10px] text-slate-300 truncate max-w-[150px]">{att.name}</span>
                  </div>
                  <a href={att.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                    <Download size={12} />
                  </a>
                </div>
              ))}
            </div>
          )}
          <label className="w-full cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
            />
            <div className="w-full py-2.5 border border-dashed border-slate-600 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors text-center">
              {file ? `📎 ${file.name}` : "+ Upload New File or Image"}
            </div>
          </label>
          {file && (
            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB – akan diupload saat Save</p>
          )}
        </div>

        {/* Group Project */}
        <label className="flex items-center gap-2.5 cursor-pointer group bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div
            onClick={() => setForm((p) => ({ ...p, isGroupProject: !p.isGroupProject }))}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
              ${form.isGroupProject ? "bg-indigo-500 border-indigo-500" : "border-slate-600 group-hover:border-slate-400"}`}
          >
            {form.isGroupProject && <Check size={10} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-slate-300 text-sm group-hover:text-slate-100 transition-colors">This is a Group Project</span>
        </label>

        {/* Notes — FIX: use textarea so multiline notes are visible and editable */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            Notes
            {isEdit && form.notes && (
              <span className="ml-2 text-[10px] text-purple-400 font-normal">(loaded from saved data)</span>
            )}
          </label>
          <textarea
            placeholder="Tambahkan catatan tambahan, hal yang perlu diingat, kesulitan, dll..."
            value={form.notes}
            onChange={upd("notes")}
            rows={3}
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-slate-200 text-sm placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all leading-relaxed"
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── TasksClient (main) ───────────────────────────────────────────────────────

export function TasksClient({ initialTasks, jobs, userId }: {
  initialTasks: Task[];
  jobs: JobOption[];
  userId: string;
}) {
  const [tasks, setTasks]             = useState<Task[]>(initialTasks);
  const [showModal, setShowModal]     = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeCol, setActiveCol]     = useState<TaskStatus | "ALL">("ALL");

  const overdue = tasks.filter((t) => t.status !== "DONE" && isOverdue(t.deadline));

  const openCreate = () => { setEditingTask(null); setShowModal(true); };
  const openEdit   = (task: Task) => { setEditingTask(task); setShowModal(true); };
  const closeModal = () => { setEditingTask(null); setShowModal(false); };

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {showModal && (
        <TaskModal
          key={editingTask?.id ?? "new"}
          userId={userId}
          jobs={jobs}
          onClose={closeModal}
          editingTask={editingTask}
          onAdd={(t) => setTasks((p) => [t, ...p])}
          onUpdate={(updated) => setTasks((p) => p.map((t) => (t.id === updated.id ? updated : t)))}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <CheckSquare size={20} className="text-amber-400" />
            <h1 className="text-white text-2xl font-bold tracking-tight">Task Manager</h1>
          </div>
          <p className="text-slate-500 text-sm">Klik 👁 untuk detail & progress log, ✏️ untuk edit.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={15} />}
          onClick={openCreate}
          className="bg-amber-600 hover:bg-amber-500 shadow-amber-500/20"
        >
          New Task
        </Button>
      </div>

      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl">
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm font-medium">
            ⚠️ {overdue.length} task{overdue.length > 1 ? "s" : ""} sudah melewati deadline!{" "}
            <button onClick={() => setActiveCol("TODO")} className="underline hover:text-red-200">
              Lihat sekarang
            </button>
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", ...STATUS_COLUMNS.map((c) => c.key)] as const).map((key) => {
          const isAll  = key === "ALL";
          const count  = isAll ? tasks.length : tasks.filter((t) => t.status === key).length;
          const label  = isAll ? "All" : STATUS_COLUMNS.find((c) => c.key === key)!.label;
          return (
            <button
              key={key}
              onClick={() => setActiveCol(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCol === key
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className={`grid gap-4 ${activeCol === "ALL" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" : "grid-cols-1"}`}>
        {STATUS_COLUMNS.map((col) => {
          if (activeCol !== "ALL" && activeCol !== col.key) return null;
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className={activeCol !== "ALL" ? "max-w-lg" : ""}>
              <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl border ${col.dimBg}`}>
                <span className={`text-xs font-bold uppercase tracking-wider ${col.accent}`}>{col.label}</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${col.accent} bg-white/10`}>{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 text-xs border border-dashed border-slate-700/50 rounded-xl">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      userId={userId}
                      onToggle={(id) =>
                        setTasks((p) =>
                          p.map((t) => (t.id === id ? { ...t, status: t.status === "DONE" ? "TODO" : "DONE" } : t))
                        )
                      }
                      onDelete={(id) => setTasks((p) => p.filter((t) => t.id !== id))}
                      onEdit={openEdit}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckSquare size={28} className="text-amber-400" />
          </div>
          <p className="text-slate-300 font-semibold mb-1">Belum ada task</p>
          <p className="text-slate-600 text-sm mb-5">Tambahkan task pertama kamu!</p>
          <Button
            variant="primary"
            leftIcon={<Plus size={15} />}
            onClick={openCreate}
            className="bg-amber-600 hover:bg-amber-500"
          >
            New Task
          </Button>
        </div>
      )}
    </div>
  );
}