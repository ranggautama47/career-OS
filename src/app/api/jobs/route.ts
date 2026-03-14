// src/app/api/jobs/route.ts
// REST API endpoint untuk Job Applications
// GET  /api/jobs?userId=xxx&status=APPLIED&search=google
// POST /api/jobs

import { NextRequest, NextResponse } from "next/server";
import {
  getJobApplications,
  createJobApplication,
} from "@/actions/job-actions";
import { JobStatus } from "@prisma/client";

// ── GET /api/jobs ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId diperlukan." },
        { status: 400 }
      );
    }

    const status = searchParams.get("status") as JobStatus | null;
    const search = searchParams.get("search") ?? undefined;

    // Validasi status jika dikirim
    const validStatuses: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "GHOSTED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid." },
        { status: 400 }
      );
    }

    const result = await getJobApplications(userId, {
      status: status ?? undefined,
      search,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ── POST /api/jobs ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, company, position, platform, link, notes, status, appliedDate, followUpDate } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId diperlukan." },
        { status: 400 }
      );
    }

    if (!company || !position || !platform) {
      return NextResponse.json(
        { success: false, error: "company, position, dan platform wajib diisi." },
        { status: 400 }
      );
    }

    const result = await createJobApplication(userId, {
      company,
      position,
      platform,
      link,
      notes,
      status,
      appliedDate: appliedDate ? new Date(appliedDate) : undefined,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
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
    console.error("[POST /api/jobs]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}