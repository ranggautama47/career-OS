// src/app/dashboard/page.tsx
// 1. Pakai getAllTasksByUser (bukan loop getTasksByJob) — lebih akurat
// 2. suppressHydrationWarning di greeting agar tidak perlu refresh

// Force dynamic rendering — dashboard selalu fresh, tidak di-cache
export const dynamic = "force-dynamic";

import {
  Briefcase,
  CheckSquare,
  FileText,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getJobApplications } from "@/actions/job-actions";
import { getNotes } from "@/actions/note-actions";
import { getAllTasksByUser } from "@/actions/task-actions";

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

// Greeting berdasarkan jam server (stabil, tidak mismatch)
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  // FIX: fetch semua task langsung berdasarkan userId
  // bukan loop per job — lebih akurat dan tidak double count
  const [jobsResult, notesResult, tasksResult] = await Promise.all([
    getJobApplications(user.id),
    getNotes(user.id),
    getAllTasksByUser(user.id),
  ]);

  const jobs = jobsResult.success && jobsResult.data ? jobsResult.data : [];
  const notes = notesResult.success && notesResult.data ? notesResult.data : [];
  const allTasks =
    tasksResult.success && tasksResult.data ? tasksResult.data : [];

  const now = new Date();
  const activeJobs = jobs.filter(
    (j) => j.status !== "REJECTED" && j.status !== "GHOSTED",
  ).length;
  const interviewJobs = jobs.filter((j) => j.status === "INTERVIEW").length;
  const offerJobs = jobs.filter((j) => j.status === "OFFER").length;
  const appliedJobs = jobs.filter((j) => j.status === "APPLIED").length;

  // Task yang deadline-nya dalam 7 hari ke depan dan belum DONE
  const tasksDueSoon = allTasks.filter((t) => {
    if (t.status === "DONE" || !t.deadline) return false;
    const diff = new Date(t.deadline).getTime() - now.getTime();
    return diff > 0 && diff < 7 * 86_400_000;
  }).length;

  // Task yang sudah lewat deadline dan belum DONE
  const overdueTasks = allTasks.filter((t) => {
    return t.status !== "DONE" && t.deadline && new Date(t.deadline) < now;
  }).length;

  // Recent activity dari data real
  type Act = { text: string; time: string; dot: string; ts: number };
  const acts: Act[] = [];

  jobs
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 3)
    .forEach((j) =>
      acts.push({
        text: `Applied to ${j.company} — ${j.position}`,
        time: timeAgo(new Date(j.createdAt)),
        dot: "bg-violet-400",
        ts: +new Date(j.createdAt),
      }),
    );

  notes
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 2)
    .forEach((n) =>
      acts.push({
        text: `New note: ${n.title}`,
        time: timeAgo(new Date(n.createdAt)),
        dot: "bg-amber-400",
        ts: +new Date(n.createdAt),
      }),
    );

  // ── Task Activity (Handling all statuses: TODO, IN_PROGRESS, REVIEW, DONE) ──
  allTasks.forEach((t) => {
    let config = { label: "Updated task", dot: "bg-slate-400" };

    // Tentukan label dan warna berdasarkan status
    switch (t.status) {
      case "TODO":
        config = { label: `New task: ${t.title}`, dot: "bg-slate-500" };
        break;
      case "DOING":
        config = { label: `Working on: ${t.title}`, dot: "bg-blue-400" };
        break;
      case "REVIEW":
        config = { label: `Reviewing: ${t.title}`, dot: "bg-amber-400" };
        break;
      case "DONE":
        config = { label: `Completed: ${t.title}`, dot: "bg-emerald-400" };
        break;
    }

    acts.push({
      text: config.label,
      time: timeAgo(new Date(t.updatedAt)),
      dot: config.dot,
      ts: +new Date(t.updatedAt),
    });
  });

  const recentActivity = acts.sort((a, b) => b.ts - a.ts).slice(0, 5);
  if (!recentActivity.length) {
    recentActivity.push({
      text: "Belum ada aktivitas. Mulai tambah job application!",
      time: "",
      dot: "bg-slate-600",
      ts: 0,
    });
  }

  const GOAL = 20;
  const goalPct = Math.min(Math.round((activeJobs / GOAL) * 100), 100);
  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Header — suppressHydrationWarning agar greeting tidak mismatch */}
      <div className="mb-8">
        <p
          className="text-slate-500 text-xs font-semibold tracking-[0.15em] uppercase mb-1.5"
          suppressHydrationWarning
        >
          {greeting}
        </p>
        <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-indigo-300">{displayName}</span>{" "}
          👋
        </h1>
        <p className="text-slate-500 text-sm mt-1.5">
          Here&apos;s what&apos;s happening with your career journey today.
        </p>
      </div>

      {/* Overdue alert */}
      {overdueTasks > 0 && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25">
          <AlertTriangle size={15} className="text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm font-medium">
            {overdueTasks} task{overdueTasks > 1 ? "s" : ""} overdue —{" "}
            <Link
              href="/dashboard/tasks"
              className="underline underline-offset-2 hover:text-red-200"
            >
              lihat sekarang
            </Link>
          </p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Active Applications",
            value: String(activeJobs),
            sub:
              interviewJobs > 0
                ? `${interviewJobs} in interview`
                : "No interviews yet",
            icon: Briefcase,
            href: "/dashboard/jobs",
            gradient: "from-violet-600/25 via-violet-500/10 to-transparent",
            border: "border-violet-500/25",
            iconBg: "bg-violet-500/15",
            iconColor: "text-violet-300",
            badge: interviewJobs > 0 ? `${interviewJobs} interview` : null,
            badgeStyle: "bg-violet-500/25 text-violet-200",
          },
          {
            label: tasksDueSoon > 0 ? "Tasks Due Soon" : "Tasks Active",
            value: String(
              tasksDueSoon > 0
                ? tasksDueSoon
                : allTasks.filter((t) => t.status !== "DONE").length,
            ),
            sub:
              overdueTasks > 0
                ? `${overdueTasks} overdue — selesaikan segera`
                : tasksDueSoon > 0
                  ? "Due within 7 days"
                  : "All on track ✓",
            icon: CheckSquare,
            href: "/dashboard/tasks",
            gradient:
              overdueTasks > 0
                ? "from-red-600/20 via-amber-600/10 to-transparent"
                : "from-amber-600/25 via-amber-500/10 to-transparent",
            border:
              overdueTasks > 0 ? "border-red-500/30" : "border-amber-500/25",
            iconBg: overdueTasks > 0 ? "bg-red-500/15" : "bg-amber-500/15",
            iconColor: overdueTasks > 0 ? "text-red-300" : "text-amber-300",
            badge: overdueTasks > 0 ? `${overdueTasks} overdue` : null,
            badgeStyle: "bg-red-500/25 text-red-300",
          },
          {
            label: "Notes Created",
            value: String(notes.length),
            sub: "AI semantic search ready",
            icon: FileText,
            href: "/dashboard/notes",
            gradient: "from-emerald-600/25 via-emerald-500/10 to-transparent",
            border: "border-emerald-500/25",
            iconBg: "bg-emerald-500/15",
            iconColor: "text-emerald-300",
            badge: null,
            badgeStyle: "",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br ${s.gradient} ${s.border} bg-slate-800/50 hover:bg-slate-800/70 hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}
                >
                  <Icon size={19} className={s.iconColor} />
                </div>
                {s.badge && (
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.badgeStyle}`}
                  >
                    {s.badge}
                  </span>
                )}
              </div>
              <div className="text-4xl font-bold text-white mb-1 tabular-nums">
                {s.value}
              </div>
              <div className="text-slate-200 text-sm font-semibold">
                {s.label}
              </div>
              <div className="text-slate-400 text-xs mt-0.5">{s.sub}</div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-60 transition-opacity">
                <TrendingUp size={14} className="text-slate-400" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <h2 className="text-slate-100 font-semibold text-sm">
                Recent Activity
              </h2>
            </div>
            <span className="text-slate-600 text-xs">Last 7 days</span>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.dot}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm leading-snug">
                    {item.text}
                  </p>
                  {item.time && (
                    <p className="text-slate-500 text-xs mt-0.5">{item.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <h2 className="text-slate-100 font-semibold text-sm mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                {
                  href: "/dashboard/jobs",
                  label: "Add job application",
                  icon: Briefcase,
                  hover:
                    "hover:bg-violet-500/15  hover:border-violet-400/40  border-violet-500/20",
                  color: "text-violet-300",
                },
                {
                  href: "/dashboard/tasks",
                  label: "Create a task",
                  icon: Target,
                  hover:
                    "hover:bg-amber-500/15   hover:border-amber-400/40   border-amber-500/20",
                  color: "text-amber-300",
                },
                {
                  href: "/dashboard/notes",
                  label: "Write a note",
                  icon: FileText,
                  hover:
                    "hover:bg-emerald-500/15 hover:border-emerald-400/40 border-emerald-500/20",
                  color: "text-emerald-300",
                },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border bg-slate-700/20 transition-all duration-200 group ${a.hover}`}
                  >
                    <Icon size={14} className={a.color} />
                    <span className="text-slate-300 text-sm group-hover:text-white transition-colors flex-1">
                      {a.label}
                    </span>
                    <span className="text-slate-600 group-hover:text-slate-300 transition-colors">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Monthly goal & mini stats */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-xs font-semibold">
                Monthly Goal
              </span>
              <span className="text-slate-400 text-xs tabular-nums font-medium">
                {activeJobs} / {GOAL} apps
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <p className="text-slate-600 text-xs mb-4">
              {goalPct}% of monthly goal
            </p>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Applied",
                  count: appliedJobs,
                  color: "text-indigo-300",
                  bg: "bg-indigo-500/10  border-indigo-500/25",
                },
                {
                  label: "Interview",
                  count: interviewJobs,
                  color: "text-violet-300",
                  bg: "bg-violet-500/10  border-violet-500/25",
                },
                {
                  label: "Offer",
                  count: offerJobs,
                  color: "text-emerald-300",
                  bg: "bg-emerald-500/10 border-emerald-500/25",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`text-center py-2.5 px-2 rounded-xl border ${s.bg}`}
                >
                  <p className={`text-xl font-bold tabular-nums ${s.color}`}>
                    {s.count}
                  </p>
                  <p className="text-slate-500 text-[10px] font-medium mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* All tasks summary */}
            <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-2">
              {[
                {
                  label: "Active Tasks",
                  count: allTasks.filter((t) => t.status !== "DONE").length,
                  color: "text-amber-300",
                  bg: "bg-amber-500/10  border-amber-500/20",
                },
                {
                  label: "Done This Week",
                  count: allTasks.filter(
                    (t) =>
                      t.status === "DONE" &&
                      +new Date(t.updatedAt) > +now - 7 * 86_400_000,
                  ).length,
                  color: "text-emerald-300",
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`text-center py-2 px-2 rounded-xl border ${s.bg}`}
                >
                  <p className={`text-xl font-bold tabular-nums ${s.color}`}>
                    {s.count}
                  </p>
                  <p className="text-slate-500 text-[10px] font-medium mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
