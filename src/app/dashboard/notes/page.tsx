// src/app/dashboard/notes/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getNotes } from "@/actions/note-actions";
import { NotesClient } from "./NotesClient";

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

  // Type-safe: pastikan data tidak undefined
  const notes: Note[] = result.success && result.data
    ? result.data.filter((n): n is Note => n !== undefined)
    : [];

  return <NotesClient initialNotes={notes} userId={user.id} />;
}