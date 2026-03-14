// src/app/dashboard/tasks/page.tsx
// Fixed: Task type now includes notes, tags, attachments so edit modal can load them

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getAllTasksByUser } from "@/actions/task-actions";
import { getJobApplications } from "@/actions/job-actions";
import { TasksClient } from "./TasksClient";
import { TaskStatus, Priority, TaskCategory } from "@prisma/client";

type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  description: string | null;
  notes: string | null;          // ← added: needed for edit modal
  status: TaskStatus;
  priority: Priority;
  deadline: Date | null;
  estimatedDays: number | null;
  isGroupProject: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: { label: string; color: string }[];
  attachments?: { id: string; url: string; name: string }[];
};

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const jobsResult = await getJobApplications(user.id);
  const jobs = jobsResult.success ? jobsResult.data : [];

  const taskResult = await getAllTasksByUser(user.id);
  const allTasks: Task[] = taskResult.success ? (taskResult.data as Task[]) : [];

  return (
    <TasksClient
      initialTasks={allTasks}
      jobs={jobs?.map((j) => ({ id: j.id, company: j.company, position: j.position })) ?? []}
      userId={user.id}
    />
  );
}