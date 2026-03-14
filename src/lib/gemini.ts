import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  const values = response.embeddings?.[0]?.values

  if (!values || values.length === 0) {
    throw new Error("Gemini embedding gagal: response kosong");
  }

  console.log(`✅ Embedding OK — ${values.length} dims`);
  return values;
}

export async function createNoteEmbedding(
  title: string,
  content: string
): Promise<number[]> {
  const text = `${title}\n${content}`.trim();
  if (!text) throw new Error("Teks kosong, tidak bisa membuat embedding");
  return createEmbedding(text);
}