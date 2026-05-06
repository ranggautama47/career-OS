// src/app/api/ai/suggest-tags/route.ts
// Gemini AI tag suggestion dari konten note — updated May 2026

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function callGemini(model: string, prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json() as { content: string };

    if (!content?.trim()) {
      return NextResponse.json({ tags: [] });
    }

    // Strip HTML tags untuk kirim plain text ke Gemini
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000);
    const prompt = `Analyze this note content and suggest 3-5 relevant, concise tags (lowercase, no spaces, use hyphens).
Return ONLY a JSON array of strings. No explanation, no markdown, just the array.
Example: ["react", "frontend", "performance"]

Note content:
${plainText}`;

    let rawText = "";
    
    // 1️⃣ gemini-3.1-flash-lite-preview — 500 RPD (terbesar, paling cocok untuk tag)
    try {
      rawText = await callGemini("gemini-3.1-flash-lite-preview", prompt);
      console.log("[suggest-tags] ✅ gemini-3.1-flash-lite-preview OK");
    } catch (e1) {
      console.warn("[suggest-tags] gemini-3.1-flash-lite-preview gagal:", (e1 as Error).message?.slice(0, 80));
      
      // 2️⃣ Fallback ke gemini-2.5-flash-lite (20 RPD)
      try {
        rawText = await callGemini("gemini-2.5-flash-lite", prompt);
        console.log("[suggest-tags] ✅ gemini-2.5-flash-lite OK");
      } catch (e2) {
        console.warn("[suggest-tags] gemini-2.5-flash-lite gagal:", (e2 as Error).message?.slice(0, 80));

        // 3️⃣ Fallback ke gemini-2.5-flash (20 RPD)
        try {
          rawText = await callGemini("gemini-2.5-flash", prompt);
          console.log("[suggest-tags] ✅ gemini-2.5-flash OK");
        } catch (e3) {
          console.warn("[suggest-tags] gemini-2.5-flash gagal juga:", (e3 as Error).message?.slice(0, 80));
        }
      }
    }

    if (!rawText) return NextResponse.json({ tags: [] });

    // Parse — strip any accidental markdown fences
    const clean = rawText.replace(/```json|```/g, "").trim();
    let tags: string[] = [];
    try {
      tags = JSON.parse(clean) as string[];
      if (!Array.isArray(tags)) tags = [];
      // Sanitize: lowercase, max 5, max 20 chars each
      tags = tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.toLowerCase().trim().replace(/\s+/g, "-").slice(0, 20))
        .slice(0, 5);
    } catch {
      tags = [];
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("[suggest-tags]", error);
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}