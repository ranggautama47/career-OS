// src/app/api/ai/related-notes/route.ts
// Related notes menggunakan cosine similarity pgvector

import { prisma } from "@/lib/prisma";
import { createEmbedding } from "@/lib/gemini";
import { NextResponse } from "next/server";

type RelatedNote = {
  id: string;
  title: string;
  similarity: number;
};

export async function POST(req: Request) {
  try {
    const { noteId, content, userId } = await req.json() as {
      noteId?: string;
      content: string;
      userId: string;
    };

    if (!content?.trim() || !userId) {
      return NextResponse.json({ notes: [] });
    }

    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);
    const embedding = await createEmbedding(plainText);
    const vectorString = `[${embedding.join(",")}]`;

    // Exclude current note if noteId provided
    const excludeClause = noteId ? `AND id != '${noteId}'` : "";

    const results = await prisma.$queryRawUnsafe<RelatedNote[]>(`
      SELECT
        id,
        title,
        CAST(1 - (embedding <=> '${vectorString}'::vector) AS float) AS similarity
      FROM "Note"
      WHERE
        "userId" = '${userId}'
        AND embedding IS NOT NULL
        ${excludeClause}
      ORDER BY
        embedding <=> '${vectorString}'::vector
      LIMIT 5
    `);

    return NextResponse.json({ notes: results });
  } catch (error) {
    console.error("[related-notes]", error);
    return NextResponse.json({ notes: [] }, { status: 500 });
  }
}