// src/app/api/ai/planner/route.ts
// AI Task Planner — menggunakan model Gemini free tier terbaru (May 2026)

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PLANNER = `You are an expert AI learning mentor inside "CareerOS".
Turn the user's goal into a detailed structured daily learning plan.
Return ONLY a valid JSON array — no explanation, no markdown, no backticks.

Format:
[
  { "day": 1, "tasks": ["specific task 1", "specific task 2", "specific task 3"] },
  { "day": 2, "tasks": ["specific task 1", "specific task 2"] }
]

Rules:
- Each day: 2-4 specific, actionable tasks
- Be practical (include resources, tools, exercises)
- Scale days based on goal complexity (3-30 days)
- Progressive difficulty: easy → intermediate → advanced`;

const FALLBACK_PLAN = [
  { "day": 1, "tasks": ["Setup lingkungan pengembangan", "Pelajari dokumentasi dasar", "Buat struktur project awal"] },
  { "day": 2, "tasks": ["Implementasi fitur inti", "Lakukan testing awal", "Catat kendala yang dihadapi"] },
  { "day": 3, "tasks": ["Iterasi berdasarkan testing", "Finalisasi dokumentasi", "Siapkan untuk review"] }
];

async function callGemini(model: string, userMessage: string): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: userMessage,
    config: { systemInstruction: SYSTEM_PLANNER, temperature: 0.5 },
  });
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!text) throw new Error("Response kosong");
  return text;
}

export async function POST(req: Request) {
  try {
    const { userMessage } = await req.json() as { userMessage: string };
    if (!userMessage?.trim()) {
      return NextResponse.json({ error: "Goal kosong" }, { status: 400 });
    }

    // 1️⃣ gemini-2.5-flash — reasoning terbaik untuk planning (20 RPD)
    try {
      const text = await callGemini("gemini-2.5-flash", userMessage);
      console.log("[planner] ✅ gemini-2.5-flash OK");
      return NextResponse.json({ text, model: "gemini-2.5-flash" });
    } catch (e1) {
      console.warn("[planner] gemini-2.5-flash gagal:", (e1 as Error).message?.slice(0, 80));
    }

    // 2️⃣ Fallback ke gemini-3-flash (20 RPD)
    try {
      const text = await callGemini("gemini-3-flash", userMessage);
      console.log("[planner] ✅ gemini-3-flash OK");
      return NextResponse.json({ text, model: "gemini-3-flash" });
    } catch (e2) {
      console.warn("[planner] gemini-3-flash gagal:", (e2 as Error).message?.slice(0, 80));
    }

    // 3️⃣ Fallback ke gemini-3.1-flash-lite-preview (500 RPD)
    try {
      const text = await callGemini("gemini-3.1-flash-lite-preview", userMessage);
      console.log("[planner] ✅ gemini-3.1-flash-lite-preview OK");
      return NextResponse.json({ text, model: "gemini-3.1-flash-lite-preview" });
    } catch (e3) {
      console.warn("[planner] gemini-3.1-flash-lite-preview gagal juga:", (e3 as Error).message?.slice(0, 80));
    }

    // 4️⃣ Static Fallback
    console.log("[planner] Pakai static JSON fallback");
    return NextResponse.json({
      text: JSON.stringify(FALLBACK_PLAN),
      model: "static",
    });

  } catch (error) {
    console.error("[planner] Unexpected error:", error);
    return NextResponse.json({
      text: JSON.stringify(FALLBACK_PLAN),
      model: "static",
    }, { status: 200 }); // Tetap return 200 agar UI tidak pecah
  }
}