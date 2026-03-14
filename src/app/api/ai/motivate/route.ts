// src/app/api/ai/motivate/route.ts
//
// Model strategy (updated Mar 2026 — sesuai Gemini API quota screenshot):
//
//  1️⃣  gemini-2.0-flash-lite   → GRATIS, quota besar, cepat  ← PRIMARY
//  2️⃣  gemini-2.0-flash-exp    → GRATIS, experimental        ← FALLBACK 1
//  3️⃣  gemini-2.0-flash        → GRATIS, 200 RPD (free tier) ← FALLBACK 2
//  4️⃣  static FALLBACK         → 5 variasi per status        ← LAST RESORT
//
// ❌ DEPRECATED (sudah 404): gemini-1.5-flash, gemini-1.5-flash-8b
// ⚠️  QUOTA KETAT (20 RPD): gemini-2.5-flash — jangan pakai untuk motivasi

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ⚠️ PENTING: pakai backtick (`), bukan tanda kutip biasa
const SYSTEM = `Kamu adalah mentor karir yang hangat dan suportif di dalam app "CareerOS".
Berikan pesan motivasi singkat (2-3 kalimat) dalam Bahasa Indonesia berdasarkan status lamaran kerja.
Buat pesannya tulus, spesifik ke situasinya, dan menyemangati.
Kembalikan HANYA teks pesannya — tanpa JSON, tanpa tanda kutip, tanpa penjelasan.

Panduan per status:
- APPLIED: Semangat menunggu, tips follow-up setelah seminggu
- INTERVIEW: Tips persiapan interview, dorong kepercayaan diri
- OFFER: Selamat + tips negosiasi gaji, jangan langsung setuju
- REJECTED: Bangkit, setiap rejection adalah pelajaran, jangan menyerah
- GHOSTED: Humor ringan + tips move on + tetap apply tempat lain`;

// ── 5 variasi static fallback per status ─────────────────────────────────
const FALLBACK: Record<string, string[]> = {
  APPLIED: [
    "📨 Langkah pertama sudah diambil — itu butuh keberanian! Tetap produktif sambil menunggu dan jangan lupa follow up setelah 1 minggu jika belum ada kabar.",
    "📨 Lamaran sudah terkirim, sekarang biarkan prosesnya berjalan! Sambil menunggu, riset lebih dalam tentang perusahaan itu agar siap ketika dipanggil.",
    "📨 Bola sudah bergulir! Setiap lamaran adalah investasi untuk masa depanmu. Jangan berhenti di satu lamaran — terus apply ke tempat lain juga ya!",
    "📨 Good job sudah mengambil tindakan! Tips: coba follow up via LinkedIn atau email HRD setelah 5-7 hari untuk menunjukkan antusiasme kamu.",
    "📨 Proses rekrutmen memang butuh waktu, tapi perjalananmu sudah dimulai! Gunakan waktu tunggu ini untuk persiapkan diri dengan latihan interview.",
  ],
  INTERVIEW: [
    "🎯 Interview adalah kesempatan emas — bukan hanya mereka menilai kamu, tapi kamu juga menilai mereka! Siapkan 3 pertanyaan cerdas untuk interviewer.",
    "🎯 Kamu sudah melewati seleksi awal, artinya CV kamu menarik! Sekarang saatnya tunjukkan kepribadian aslimu. Latihan STAR method malam ini ya!",
    "🎯 Deg-degan itu wajar, tapi ingat: mereka juga ingin kamu berhasil! Tidur cukup, siapkan pakaian dari sekarang, datang 10 menit lebih awal.",
    "🎯 Kepercayaan diri tumbuh dari persiapan yang matang. Review pengalaman terbaikmu dan bagaimana itu relevan dengan posisi ini.",
    "🎯 Research mendalam tentang perusahaan dan tantangan industri mereka akan membedakan kamu dari kandidat lain. You've got this, semangat!",
  ],
  OFFER: [
    "🎉 Selamat, kerja keras kamu terbayar! Jangan langsung setuju — minta 1-2 hari untuk review penawaran. Negosiasi gaji itu normal dan diharapkan!",
    "🎉 Offer letter sudah di tangan — amazing! Sebelum tanda tangan, pastikan kamu memahami semua benefit, jam kerja, dan ekspektasi peran dengan jelas.",
    "🎉 Tips negosiasi: fokus pada nilai yang kamu bawa, bukan kebutuhan personal. 'Berdasarkan riset pasar dan pengalaman saya...' adalah pembuka yang kuat.",
    "🎉 Kalau ada multiple offer, bandingkan bukan hanya gaji tapi juga growth opportunity, culture, dan benefit jangka panjang sebelum memutuskan.",
    "🎉 Mereka sudah memilih kamu — artinya posisi tawarmu kuat! Gunakan kesempatan ini untuk bernegosiasi dengan percaya diri dan bijaksana.",
  ],
  REJECTED: [
    "😔 Rejection bukan tentang siapa kamu, tapi tentang fit di waktu itu. Minta feedback jika memungkinkan — itu data berharga untuk lamaran berikutnya!",
    "😔 Banyak orang sukses pernah ditolak puluhan kali sebelum mendapat pekerjaan impian mereka. Istirahat sebentar, lalu bangkit lebih kuat dari sebelumnya!",
    "😔 Rejection = redirection menuju tempat yang lebih cocok untukmu. Analisis apa yang bisa diperbaiki, lalu apply dengan versi terbaik dirimu!",
    "😔 Gunakan pengalaman ini sebagai data: skills apa yang perlu ditingkatkan? Interview skill apa yang perlu diasah? Setiap rejection adalah pelajaran berharga.",
    "😔 Semua orang sukses punya segudang cerita rejection. Yang membedakan mereka adalah mereka tidak berhenti. Kamu masih dalam proses, terus maju!",
  ],
  GHOSTED: [
    "👻 Di-ghosting memang menyebalkan, tapi ini bukan cerminan nilai kamu! Kirim satu follow-up email yang sopan, lalu fokus ke peluang lain yang lebih menjanjikan.",
    "👻 Anggap saja ini dodged bullet — perusahaan dengan komunikasi yang buruk mungkin memang bukan tempat terbaik untukmu. Move on dengan kepala tegak!",
    "👻 Coba follow up sekali via LinkedIn dengan pesan yang friendly dan singkat. Kalau 3 hari masih diam, tandai sebagai closed dan lanjut ke next opportunity!",
    "👻 Boo! Mereka menghilang, tapi semangatmu tidak perlu ikut hilang. Tutup bab ini dan alihkan energimu ke 3 lamaran baru hari ini — quantity matters!",
    "👻 Kamu tidak bisa mengontrol respons orang lain, hanya tindakanmu sendiri. Keep applying, keep networking — rezekimu pasti ada di tempat yang tepat!",
  ],
};

function getRandomFallback(status: string): string {
  const msgs = FALLBACK[status] ?? FALLBACK["APPLIED"];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// ── Panggil Gemini model tertentu ─────────────────────────────────────────
async function callGemini(model: string, context: string): Promise<string> {
  const response = await ai.models.generateContent({
    model,
    contents: context,
    config: {
      systemInstruction: SYSTEM,
      temperature: 0.9,
    },
  });
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!text) throw new Error("Response kosong dari model");
  return text;
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json() as { status?: string; company?: string; position?: string };
    const status   = body.status ?? "APPLIED";
    const company  = body.company ?? "";
    const position = body.position ?? "";

    const context = company && position
      ? `Status lamaran: ${status}\nPerusahaan: ${company}\nPosisi: ${position}`
      : `Status lamaran: ${status}`;

    // 1️⃣ gemini-2.0-flash-lite — gratis, quota besar, TIDAK deprecated
    try {
      const text = await callGemini("gemini-2.0-flash-lite", context);
      console.log("[motivate] ✅ gemini-2.0-flash-lite OK");
      return NextResponse.json({ message: text, model: "gemini-2.0-flash-lite" });
    } catch (e1) {
      console.warn("[motivate] gemini-2.0-flash-lite gagal:", (e1 as Error).message?.slice(0, 100));
    }

    // 2️⃣ gemini-2.0-flash-exp — gratis, experimental (sering quota lebih longgar)
    try {
      const text = await callGemini("gemini-2.0-flash-exp", context);
      console.log("[motivate] ✅ gemini-2.0-flash-exp OK");
      return NextResponse.json({ message: text, model: "gemini-2.0-flash-exp" });
    } catch (e2) {
      console.warn("[motivate] gemini-2.0-flash-exp gagal:", (e2 as Error).message?.slice(0, 100));
    }

    // 3️⃣ gemini-2.0-flash — free tier 200 RPD
    try {
      const text = await callGemini("gemini-2.0-flash", context);
      console.log("[motivate] ✅ gemini-2.0-flash OK");
      return NextResponse.json({ message: text, model: "gemini-2.0-flash" });
    } catch (e3) {
      console.warn("[motivate] gemini-2.0-flash gagal:", (e3 as Error).message?.slice(0, 100));
    }

    // 4️⃣ Static fallback — 5 variasi per status, random tiap refresh
    console.log("[motivate] ⚠️ Semua model gagal, pakai static fallback. Status:", status);
    return NextResponse.json({ message: getRandomFallback(status), model: "static" });

  } catch (e) {
    console.error("[motivate] Unexpected error:", e);
    return NextResponse.json({
      message: getRandomFallback("APPLIED"),
      model: "static",
    });
  }
}