// src/app/api/tasks/route.ts
// REST API endpoint untuk Tasks
// GET  /api/tasks?userId=xxx&jobApplicationId=yyy
// POST /api/tasks

import { NextRequest, NextResponse } from "next/server";
import {
  getTasksByJob,
  createTask,
} from "@/actions/task-actions";
import { Priority } from "@prisma/client";

// ── GET /api/tasks ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const jobApplicationId = searchParams.get("jobApplicationId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId diperlukan." },
        { status: 400 }
      );
    }

    if (!jobApplicationId) {
      return NextResponse.json(
        { success: false, error: "jobApplicationId diperlukan." },
        { status: 400 }
      );
    }

    const result = await getTasksByJob(userId, jobApplicationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ── POST /api/tasks ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      jobApplicationId,
      title,
      description,
      priority,
      deadline,
      estimatedDays,
      isGroupProject,
    } = body;

    if (!userId || !jobApplicationId) {
      return NextResponse.json(
        { success: false, error: "userId dan jobApplicationId diperlukan." },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: "title tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Validasi priority jika dikirim
    const validPriorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: "Priority tidak valid." },
        { status: 400 }
      );
    }

    const result = await createTask(userId, jobApplicationId, {
      title: title.trim(),
      description,
      priority: priority ?? "MEDIUM",
      deadline: deadline ? new Date(deadline) : undefined,
      estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined,
      isGroupProject: isGroupProject ?? false,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/tasks]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}