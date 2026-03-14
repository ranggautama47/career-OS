// src/lib/vector-search.ts
// FIXED: $executeRawUnsafe (bukan $executeRaw) agar ::vector cast berjalan benar

import { prisma } from "@/lib/prisma";
import { createEmbedding } from "@/lib/gemini";

export type NoteSearchResult = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  similarity: number;
  createdAt: Date;
  updatedAt: Date;
};

const TOP_K = 5;

export async function searchNotes(
  userId: string,
  query: string
): Promise<NoteSearchResult[]> {
  if (!userId || !query?.trim()) return [];

  const queryEmbedding = await createEmbedding(query.trim());
  const vectorString = `[${queryEmbedding.join(",")}]`;

  // $queryRawUnsafe: interpolasi langsung agar ::vector cast tidak di-quote Prisma
  const results = await prisma.$queryRawUnsafe<NoteSearchResult[]>(`
    SELECT
      id,
      title,
      content,
      tags,
      "createdAt",
      "updatedAt",
      CAST(1 - (embedding <=> '${vectorString}'::vector) AS float) AS similarity
    FROM "Note"
    WHERE
      "userId" = '${userId}'
      AND embedding IS NOT NULL
    ORDER BY
      embedding <=> '${vectorString}'::vector
    LIMIT ${TOP_K}
  `);

  return results;
}

export async function saveNoteEmbedding(
  noteId: string,
  embedding: number[]
): Promise<void> {
  if (!embedding || embedding.length === 0) {
    throw new Error("Embedding kosong");
  }

  const vectorString = `[${embedding.join(",")}]`;
  console.log(`💾 Menyimpan embedding (${embedding.length} dims) untuk Note: ${noteId}`);

  // FIXED: $executeRawUnsafe dengan $1::vector agar vector cast benar
  const result = await prisma.$executeRawUnsafe(
    `UPDATE "Note" SET embedding = $1::vector WHERE id = $2`,
    vectorString,
    noteId
  );

  if (result === 0) {
    throw new Error(`Note ${noteId} tidak ditemukan saat menyimpan embedding`);
  }

  console.log(`✅ Embedding tersimpan! Note: ${noteId}, rows: ${result}`);
}

export async function generateAndSaveNoteEmbedding(
  noteId: string,
  title: string,
  content: string
): Promise<void> {
  if (!title && !content) return;

  console.log(`🔄 Generating embedding untuk Note: "${title}"`);
  const { createNoteEmbedding } = await import("@/lib/gemini");
  const embedding = await createNoteEmbedding(title, content);
  await saveNoteEmbedding(noteId, embedding);
  console.log(`🎉 Selesai untuk Note: ${noteId}`);
}