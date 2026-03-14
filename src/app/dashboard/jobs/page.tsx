// src/app/dashboard/jobs/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getJobApplications } from "@/actions/job-actions";
import { JobsClient } from "./JobsClient";

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getJobApplications(user.id);

  // Type-safe: fallback ke array kosong jika gagal
  const jobs = result.success && result.data ? result.data : [];

  return <JobsClient initialJobs={jobs} userId={user.id} />;
}