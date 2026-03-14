"use server";

// src/actions/note-actions.ts
// Fixed: embedding error tidak lagi silent, updateNote juga regenerate embedding

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAndSaveNoteEmbedding } from "@/lib/vector-search";

export type NotePayload = {
  title: string;
  content: string;
  tags?: string[];
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createNote(
  userId: string,
  payload: NotePayload
): Promise<ActionResult<{ id: string; title: string }>> {
  try {
    if (!userId) return { success: false, error: "userId tidak boleh kosong." };
    if (!payload.title?.trim()) return { success: false, error: "Judul note tidak boleh kosong." };
    if (!payload.content?.trim()) return { success: false, error: "Konten note tidak boleh kosong." };

    const note = await prisma.note.create({
      data: {
        userId,
        title:   payload.title.trim(),
        content: payload.content.trim(),
        tags:    payload.tags ?? [],
      },
      select: { id: true, title: true },
    });

    // Generate embedding — error tidak gagalkan create, tapi ter-log
    try {
      await generateAndSaveNoteEmbedding(
        note.id,
        payload.title.trim(),
        payload.content.trim()
      );
    } catch (embeddingError) {
      console.error(`[createNote] ⚠️ Embedding gagal untuk note ${note.id}:`, embeddingError);
    }

    revalidatePath("/dashboard/notes");
    return { success: true, data: note };
  } catch (error) {
    console.error("[createNote]", error);
    return { success: false, error: "Gagal membuat note." };
  }
}

// ─────────────────────────────────────────────
// SYNC MISSING EMBEDDINGS
// ─────────────────────────────────────────────

type NoteSyncItem = { id: string; title: string; content: string };

export async function syncMissingEmbeddings(): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  try {
    const notes = await prisma.$queryRaw<NoteSyncItem[]>`
      SELECT id, title, content FROM "Note" WHERE embedding IS NULL
    `;

    if (notes.length === 0) {
      console.log("✅ Semua note sudah punya embedding.");
      return { success: true, count: 0 };
    }

    console.log(`⏳ Sync ${notes.length} note...`);
    let synced = 0;

    for (const note of notes) {
      try {
        await generateAndSaveNoteEmbedding(note.id, note.title, note.content);
        console.log(`  ✔ "${note.title}"`);
        synced++;
      } catch (err) {
        console.error(`  ✘ "${note.title}":`, err);
      }
    }

    return { success: true, count: synced };
  } catch (error) {
    console.error("[syncMissingEmbeddings]", error);
    return { success: false, error: "Sync gagal." };
  }
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export type NoteFilters = { search?: string; tag?: string };

export async function getNotes(userId: string, filters?: NoteFilters) {
  try {
    if (!userId) return { success: false, error: "userId tidak boleh kosong." };

    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(filters?.search && { title: { contains: filters.search, mode: "insensitive" } }),
        ...(filters?.tag    && { tags: { has: filters.tag } }),
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, content: true, tags: true, createdAt: true, updatedAt: true },
    });

    return { success: true, data: notes };
  } catch (error) {
    console.error("[getNotes]", error);
    return { success: false, error: "Gagal mengambil data notes." };
  }
}

export async function getNoteById(userId: string, noteId: string) {
  try {
    if (!userId || !noteId) return { success: false, error: "userId dan noteId tidak boleh kosong." };

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
      select: { id: true, title: true, content: true, tags: true, createdAt: true, updatedAt: true },
    });

    if (!note) return { success: false, error: "Note tidak ditemukan." };
    return { success: true, data: note };
  } catch (error) {
    console.error("[getNoteById]", error);
    return { success: false, error: "Gagal mengambil note." };
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateNote(
  userId: string,
  noteId: string,
  payload: Partial<NotePayload>
): Promise<ActionResult<{ id: string; title: string; updatedAt: Date }>> {
  try {
    const existing = await prisma.note.findFirst({
      where: { id: noteId, userId },
      select: { id: true, title: true, content: true },
    });

    if (!existing) return { success: false, error: "Note tidak ditemukan atau bukan milik kamu." };

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: {
        ...(payload.title?.trim()      && { title:   payload.title.trim()   }),
        ...(payload.content?.trim()    && { content: payload.content.trim() }),
        ...(payload.tags !== undefined && { tags:    payload.tags           }),
      },
      select: { id: true, title: true, content: true, updatedAt: true },
    });

    // Re-generate embedding setelah update
    try {
      await generateAndSaveNoteEmbedding(
        updated.id,
        payload.title?.trim()   ?? existing.title,
        payload.content?.trim() ?? existing.content
      );
    } catch (embeddingError) {
      console.error(`[updateNote] ⚠️ Embedding gagal untuk note ${noteId}:`, embeddingError);
    }

    revalidatePath("/dashboard/notes");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateNote]", error);
    return { success: false, error: "Gagal mengupdate note." };
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deleteNote(
  userId: string,
  noteId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const existing = await prisma.note.findFirst({
      where: { id: noteId, userId },
      select: { id: true },
    });

    if (!existing) return { success: false, error: "Note tidak ditemukan atau bukan milik kamu." };

    await prisma.note.delete({ where: { id: noteId } });

    revalidatePath("/dashboard/notes");
    return { success: true, data: { id: noteId } };
  } catch (error) {
    console.error("[deleteNote]", error);
    return { success: false, error: "Gagal menghapus note." };
  }
}

// ─────────────────────────────────────────────
// AI SEMANTIC SEARCH
// ─────────────────────────────────────────────

export async function searchNotesAI(
  userId: string,
  query: string
): Promise<ActionResult<{ id: string; title: string; content: string; tags: string[]; similarity: number }[]>> {
  try {
    if (!userId) return { success: false, error: "userId tidak boleh kosong." };
    if (!query?.trim()) return { success: false, error: "Query tidak boleh kosong." };

    const { searchNotes } = await import("@/lib/vector-search");
    const results = await searchNotes(userId, query.trim());

    return { success: true, data: results };
  } catch (error) {
    console.error("[searchNotesAI]", error);
    return { success: false, error: "AI search gagal. Cek GEMINI_API_KEY dan pastikan embedding sudah ada." };
  }
}