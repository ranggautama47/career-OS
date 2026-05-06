// src/app/api/ai/coach/route.ts
// AI Career Coach — menggunakan model Gemini free tier terbaru (May 2026)

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_COACH = `You are an expert AI Career Coach inside "CareerOS".
Analyze the resume carefully and return ONLY valid JSON — no explanation, no markdown, no backticks.
Be specific and actionable in your feedback.

Exact JSON format:
{
  "score": 82,
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "improvements": ["actionable improvement 1", "actionable improvement 2", "actionable improvement 3"],
  "missing": ["missing skill 1", "missing skill 2"],
  "ats": ["ats tip 1", "ats tip 2"]
}

Score guide: 90-100=excellent, 75-89=good, 60-74=average, <60=needs major work.`;

const FALLBACK_COACH = {
  score: 70,
  strengths: ["Persiapan sudah dimulai", "Struktur resume standar"],
  weaknesses: ["Kurangnya data kuantitatif", "Deskripsi kurang spesifik"],
  improvements: ["Tambahkan angka pencapaian", "Gunakan kata kerja aksi"],
  missing: ["Keywords industri spesifik"],
  ats: ["Gunakan font standar", "Hindari grafik berlebihan"]
};

async function callGemini(model: string, userMessage: string): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: userMessage,
    config: { systemInstruction: SYSTEM_COACH, temperature: 0.3 },
  });
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!text) throw new Error("Response kosong");
  return text;
}

export async function POST(req: Request) {
  try {
    const { userMessage } = await req.json() as { userMessage: string };
    if (!userMessage?.trim()) {
      return NextResponse.json({ error: "Resume text kosong" }, { status: 400 });
    }

    // 1️⃣ gemini-2.5-flash — reasoning terbaik untuk analisis resume (20 RPD)
    try {
      const text = await callGemini("gemini-2.5-flash", userMessage);
      console.log("[coach] ✅ gemini-2.5-flash OK");
      return NextResponse.json({ text, model: "gemini-2.5-flash" });
    } catch (e1) {
      console.warn("[coach] gemini-2.5-flash gagal:", (e1 as Error).message?.slice(0, 80));
    }

    // 2️⃣ Fallback ke gemini-3-flash (20 RPD)
    try {
      const text = await callGemini("gemini-3-flash", userMessage);
      console.log("[coach] ✅ gemini-3-flash OK");
      return NextResponse.json({ text, model: "gemini-3-flash" });
    } catch (e2) {
      console.warn("[coach] gemini-3-flash gagal:", (e2 as Error).message?.slice(0, 80));
    }

    // 3️⃣ Fallback ke gemini-3.1-flash-lite-preview (500 RPD)
    try {
      const text = await callGemini("gemini-3.1-flash-lite-preview", userMessage);
      console.log("[coach] ✅ gemini-3.1-flash-lite-preview OK");
      return NextResponse.json({ text, model: "gemini-3.1-flash-lite-preview" });
    } catch (e3) {
      console.warn("[coach] gemini-3.1-flash-lite-preview gagal juga:", (e3 as Error).message?.slice(0, 80));
    }

    // 4️⃣ Static Fallback
    console.log("[coach] Pakai static JSON fallback");
    return NextResponse.json({
      text: JSON.stringify(FALLBACK_COACH),
      model: "static",
    });

  } catch (error) {
    console.error("[coach] Unexpected error:", error);
    return NextResponse.json({
      text: JSON.stringify(FALLBACK_COACH),
      model: "static",
    }, { status: 200 }); // Tetap return 200 agar UI tidak pecah
  }
}