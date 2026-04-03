// src/app/dashboard/notes/page.tsx
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { getCurrentUser } from "@/lib/supabase-server";
import { getNotes } from "@/actions/note-actions";

// Dynamic import — TipTap editor tidak di-load sampai halaman notes dibuka
// Ini kurangi JS bundle di halaman lain secara signifikan
const NotesClient = dynamic(
  () => import("./NotesClient").then((m) => ({ default: m.NotesClient })),
  {
    loading: () => (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading notes...</div>
      </div>
    ),
    ssr: false,
  },
);

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getNotes(user.id);

  const notes: Note[] =
    result.success && result.data
      ? result.data.filter((n): n is Note => n !== undefined)
      : [];

  return <NotesClient initialNotes={notes} userId={user.id} />;
}
