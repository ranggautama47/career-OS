import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "File tidak ditemukan" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Pastikan folder ada
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: "/uploads/" + fileName,
    });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({
      success: false,
      error: "Upload gagal: " + String(error),
    });
  }
}