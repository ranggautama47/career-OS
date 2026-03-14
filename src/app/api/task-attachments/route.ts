import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const { taskId, url, name } = body;

  if (!taskId || !url) {
    return NextResponse.json(
      { success: false, error: "taskId dan url diperlukan" },
      { status: 400 }
    );
  }

  const attachment = await prisma.taskAttachment.create({
    data: {
      taskId,
      url,
      name,
    },
  });

  return NextResponse.json({
    success: true,
    data: attachment,
  });
}