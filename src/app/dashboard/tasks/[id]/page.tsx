// src/app/dashboard/tasks/[id]/page.tsx
// Fixed: import uses @/ alias (not relative '../TaskDetail')

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getTaskById } from "@/actions/task-actions";
import { TaskDetail } from "@/app/dashboard/tasks/TaskDetail";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const res = await getTaskById(user.id, id);

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Task Tidak Ditemukan</h1>
          <p className="text-slate-500 mb-6 text-sm">Mungkin sudah dihapus atau kamu tidak memiliki akses.</p>
          <a
            href="/dashboard/tasks"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            ← Kembali ke Task Manager
          </a>
        </div>
      </div>
    );
  }

  const task = res.data;

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <TaskDetail
        task={{
          id:             task.id,
          title:          task.title,
          description:    task.description    ?? null,
          notes:          task.notes          ?? null,
          status:         task.status,
          priority:       task.priority,
          category:       task.category,
          deadline:       task.deadline       ?? null,
          estimatedDays:  task.estimatedDays  ?? null,
          isGroupProject: task.isGroupProject,
          checklist:      task.checklist      ?? [],
          attachments:    task.attachments    ?? [],
          logs:           task.logs           ?? [],
          jobApplication: task.jobApplication ?? null,
        }}
        userId={user.id}
      />
    </div>
  );
}