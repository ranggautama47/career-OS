import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { taskId, label, color } = await req.json();

    const tag = await prisma.taskTag.create({
      data: {
        taskId,
        label,
        color,
      },
    });

    return NextResponse.json({
      success: true,
      data: tag,
    });

  } catch (error) {
    console.error("[task-tags]", error);

    return NextResponse.json({
      success: false,
      error: "Gagal menyimpan tag",
    });
  }
}