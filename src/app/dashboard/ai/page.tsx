// src/app/dashboard/ai/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import AiToolsClient from "./AiToolsClient";

export default async function AiToolsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <AiToolsClient />;
}