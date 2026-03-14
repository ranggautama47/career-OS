// src/app/api/ai/search-notes/route.ts
// AI-powered semantic search endpoint menggunakan pgvector
// POST /api/ai/search-notes
// Body: { "query": "string", "userId": "string" }

import { NextRequest, NextResponse } from "next/server";
import { searchNotes } from "@/lib/vector-search";

// ── POST /api/ai/search-notes ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId } = body;

    // ── Validasi input ─────────────────────────────────────────────────────

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId diperlukan." },
        { status: 400 }
      );
    }

    if (!query?.trim()) {
      return NextResponse.json(
        { success: false, error: "query tidak boleh kosong." },
        { status: 400 }
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "query minimal 2 karakter." },
        { status: 400 }
      );
    }

    // ── Jalankan semantic search ───────────────────────────────────────────
    // Flow:
    // 1. query → OpenAI embedding
    // 2. embedding → cosine similarity search di pgvector
    // 3. return top 5 notes paling relevan

    const results = await searchNotes(userId, query.trim());

    return NextResponse.json({
      success: true,
      query: query.trim(),
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("[POST /api/ai/search-notes]", error);

    // Cek apakah error dari OpenAI (API key, quota, dll)
    const errMessage = error instanceof Error ? error.message : "Internal server error.";
    const isOpenAIError = errMessage.includes("OpenAI") || errMessage.includes("API key");

    return NextResponse.json(
      {
        success: false,
        error: isOpenAIError
          ? "AI search tidak tersedia saat ini. Periksa konfigurasi OpenAI API key."
          : "Internal server error.",
      },
      { status: 500 }
    );
  }
}