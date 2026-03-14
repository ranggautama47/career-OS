"use server";

import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function upsertUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: user.email ?? `${userId}@unknown.com`,
      name: user.user_metadata?.full_name ?? null,
    },
  });
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type JobApplicationPayload = {
  company: string;
  position: string;
  platform: string;
  link?: string;
  status?: JobStatus;
  appliedDate?: Date;
  followUpDate?: Date;
  notes?: string;
  // HRD Info
  hrdName?: string;
  hrdEmail?: string;
  hrdInstagram?: string;
  hrdLinkedin?: string;
  salaryMin?: number;
  salaryMax?: number;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Membuat job application baru untuk user tertentu.
 * @param userId - ID user yang sedang login
 * @param payload - Data job application
 */
export async function createJobApplication(
  userId: string,
  payload: JobApplicationPayload
): Promise<ActionResult<{ id: string; company: string; position: string }>> {
  try {
    if (!userId) {
      return { success: false, error: "User ID tidak boleh kosong." };
    }
    if (!payload.company || !payload.position || !payload.platform) {
      return {
        success: false,
        error: "Company, position, dan platform wajib diisi.",
      };
    }

    // Sync Supabase Auth user → Prisma User table (FK constraint)
    await upsertUser(userId);

    const job = await prisma.jobApplication.create({
      data: {
        userId,
        company: payload.company,
        position: payload.position,
        platform: payload.platform,
        link: payload.link,
        status: payload.status ?? "APPLIED",
        appliedDate: payload.appliedDate ?? new Date(),
        followUpDate: payload.followUpDate,
        notes: payload.notes,
      },
      select: {
        id: true,
        company: true,
        position: true,
      },
    });

    revalidatePath("/jobs");
    return { success: true, data: job };
  } catch (error) {
    console.error("[createJobApplication]", error);
    return { success: false, error: "Gagal membuat job application." };
  }
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export type JobApplicationFilters = {
  status?: JobStatus;
  search?: string; // filter by company or position
};

/**
 * Mengambil semua job applications milik user.
 * Mendukung filter berdasarkan status dan pencarian teks.
 */
export async function getJobApplications(
  userId: string,
  filters?: JobApplicationFilters
) {
  try {
    if (!userId) {
      return { success: false, error: "User ID tidak boleh kosong." };
    }

    const jobs = await prisma.jobApplication.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && {
          OR: [
            { company: { contains: filters.search, mode: "insensitive" } },
            { position: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { appliedDate: "desc" },
      select: {
        id: true,
        company: true,
        position: true,
        platform: true,
        link: true,
        status: true,
        appliedDate: true,
        followUpDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: jobs };
  } catch (error) {
    console.error("[getJobApplications]", error);
    return { success: false, error: "Gagal mengambil data job applications." };
  }
}

/**
 * Mengambil satu job application berdasarkan ID.
 * Memastikan job tersebut memang milik user yang bersangkutan.
 */
export async function getJobApplicationById(userId: string, jobId: string) {
  try {
    const job = await prisma.jobApplication.findFirst({
      where: { id: jobId, userId },
    });
    if (!job) return { success: false, error: "Job application tidak ditemukan." };
    return { success: true, data: job };
  } catch (error) {
    console.error("[getJobApplicationById]", error);
    return { success: false, error: "Gagal mengambil job application." };
  }
}

/**
 * Alias getJobById — dipakai di halaman detail job, include logs.
 */
export async function getJobById(userId: string, jobId: string) {
  try {
    const data = await prisma.jobApplication.findFirst({
      where: { id: jobId, userId },
      include: { logs: { orderBy: { date: "desc" } } },
    });
    if (!data) return { success: false as const, error: "Lamaran tidak ditemukan" };
    return { success: true as const, data };
  } catch (error) {
    console.error("[getJobById]", error);
    return { success: false as const, error: "Gagal mengambil data" };
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Mengupdate data job application.
 * Hanya field yang dikirim yang akan diupdate (partial update).
 */
export async function updateJobApplication(
  userId: string,
  jobId: string,
  payload: Partial<JobApplicationPayload>
): Promise<ActionResult<{ id: string; status: JobStatus }>> {
  try {
    // Pastikan job application milik user ini
    const existing = await prisma.jobApplication.findFirst({
      where: { id: jobId, userId },
    });

    if (!existing) {
      return {
        success: false,
        error: "Job application tidak ditemukan atau bukan milik kamu.",
      };
    }

    const updated = await prisma.jobApplication.update({
      where: { id: jobId },
      data: {
        ...(payload.company && { company: payload.company }),
        ...(payload.position && { position: payload.position }),
        ...(payload.platform && { platform: payload.platform }),
        ...(payload.link !== undefined && { link: payload.link }),
        ...(payload.status && { status: payload.status }),
        ...(payload.appliedDate && { appliedDate: payload.appliedDate }),
        ...(payload.followUpDate !== undefined && {
          followUpDate: payload.followUpDate,
        }),
        ...(payload.notes        !== undefined && { notes:        payload.notes }),
        ...(payload.hrdName      !== undefined && { hrdName:      payload.hrdName }),
        ...(payload.hrdEmail     !== undefined && { hrdEmail:     payload.hrdEmail }),
        ...(payload.hrdInstagram !== undefined && { hrdInstagram: payload.hrdInstagram }),
        ...(payload.hrdLinkedin  !== undefined && { hrdLinkedin:  payload.hrdLinkedin }),
        ...(payload.salaryMin    !== undefined && { salaryMin:    payload.salaryMin }),
        ...(payload.salaryMax    !== undefined && { salaryMax:    payload.salaryMax }),
      },
      select: {
        id: true,
        status: true,
      },
    });

    revalidatePath("/jobs");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateJobApplication]", error);
    return { success: false, error: "Gagal mengupdate job application." };
  }
}

/**
 * Shortcut khusus untuk update status saja (dipakai di Kanban drag & drop).
 */
export async function updateJobStatus(
  userId: string,
  jobId: string,
  status: JobStatus
): Promise<ActionResult<{ id: string; status: JobStatus }>> {
  return updateJobApplication(userId, jobId, { status });
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Menghapus job application berdasarkan ID.
 * Validasi ownership sebelum delete.
 */
export async function deleteJobApplication(
  userId: string,
  jobId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const existing = await prisma.jobApplication.findFirst({
      where: { id: jobId, userId },
    });

    if (!existing) {
      return {
        success: false,
        error: "Job application tidak ditemukan atau bukan milik kamu.",
      };
    }

    await prisma.jobApplication.delete({
      where: { id: jobId },
    });

    revalidatePath("/jobs");
    return { success: true, data: { id: jobId } };
  } catch (error) {
    console.error("[deleteJobApplication]", error);
    return { success: false, error: "Gagal menghapus job application." };
  }
}

// ─────────────────────────────────────────────
// JOB LOG
// ─────────────────────────────────────────────

/**
 * Tambah progress log ke job application.
 */
export async function addJobLog(userId: string, jobId: string, content: string) {
  try {
    const job = await prisma.jobApplication.findFirst({ where: { id: jobId, userId } });
    if (!job) return { success: false as const, error: "Lamaran tidak ditemukan" };
    const data = await prisma.jobLog.create({ data: { jobId, content } });
    return { success: true as const, data };
  } catch (error) {
    console.error("[addJobLog]", error);
    return { success: false as const, error: "Gagal tambah log" };
  }
}

/**
 * Hapus progress log dari job application.
 */
export async function deleteJobLog(userId: string, logId: string) {
  try {
    const log = await prisma.jobLog.findFirst({
      where: { id: logId, job: { userId } },
    });
    if (!log) return { success: false as const, error: "Log tidak ditemukan" };
    await prisma.jobLog.delete({ where: { id: logId } });
    return { success: true as const };
  } catch (error) {
    console.error("[deleteJobLog]", error);
    return { success: false as const, error: "Gagal hapus log" };
  }
}