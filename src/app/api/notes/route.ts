// src/app/api/notes/route.ts
// REST API endpoint untuk Notes
// GET  /api/notes?userId=xxx&search=xxx&tag=xxx
// POST /api/notes  (auto-generate embedding setelah create)

import { NextRequest, NextResponse } from "next/server";
import { getNotes, createNote } from "@/actions/note-actions";
import { generateAndSaveNoteEmbedding } from "@/lib/vector-search";

// ── GET /api/notes ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId diperlukan." },
        { status: 400 }
      );
    }

    const search = searchParams.get("search") ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;

    const result = await getNotes(userId, { search, tag });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("[GET /api/notes]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ── POST /api/notes ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, content, tags } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId diperlukan." },
        { status: 400 }
      );
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: "title dan content wajib diisi." },
        { status: 400 }
      );
    }

    // Step 1: Simpan note ke database
    const result = await createNote(userId, {
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    const noteId = result.data.id;

    // Step 2: Generate + simpan embedding secara async (non-blocking)
    // Tidak perlu await — user tidak perlu nunggu embedding selesai
    await generateAndSaveNoteEmbedding(
      noteId,
      title.trim(),
      content.trim()
    );

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/notes]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}