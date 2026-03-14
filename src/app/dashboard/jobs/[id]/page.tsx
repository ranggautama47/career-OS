// src/app/dashboard/jobs/[id]/page.tsx

import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getJobById } from "@/actions/job-actions";
import JobDetailClient from "./JobDetailClient";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getJobById(user.id, id);
  if (!result.success) notFound();

  return <JobDetailClient job={result.data} userId={user.id} />;
}