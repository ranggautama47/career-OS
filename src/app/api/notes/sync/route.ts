import { syncMissingEmbeddings } from "@/actions/note-actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await syncMissingEmbeddings();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Gagal sync" }, { status: 500 });
  }
}