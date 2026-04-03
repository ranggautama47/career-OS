// src/app/dashboard/ai/page.tsx
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { getCurrentUser } from "@/lib/supabase-server";

// Dynamic import — AI tools JS tidak di-load sampai halaman ini dibuka
const AiToolsClient = dynamic(() => import("./AiToolsClient"), {
  loading: () => (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="text-slate-500 text-sm">Loading AI Tools...</div>
    </div>
  ),
  ssr: false,
});

export default async function AiToolsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <AiToolsClient />;
}
