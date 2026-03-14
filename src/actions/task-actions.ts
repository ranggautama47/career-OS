"use server";

import { prisma } from "@/lib/prisma";
import { Priority, TaskStatus, TaskCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// ─────────────────────────────────────────────
// HELPER — sync Supabase Auth user → Prisma User table
// ─────────────────────────────────────────────

/**
 * Upsert the authenticated user into the Prisma `User` table.
 * This is required because Task/Job tables have a FK → User.id,
 * but Supabase Auth stores users in auth.users (separate schema).
 */
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

export type TaskPayload = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  category?: TaskCategory;
  deadline?: Date;
  estimatedDays?: number;
  isGroupProject?: boolean;
  notes?: string;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─────────────────────────────────────────────
// HELPER — verifikasi job ownership
// ─────────────────────────────────────────────

/**
 * Memastikan jobApplicationId yang dikirim benar-benar milik userId.
 * Dipanggil sebelum setiap operasi task supaya user tidak bisa
 * memanipulasi task di job milik orang lain.
 */
async function verifyJobOwnership(
  userId: string,
  jobApplicationId: string
): Promise<boolean> {
  const job = await prisma.jobApplication.findFirst({
    where: { id: jobApplicationId, userId },
    select: { id: true },
  });
  return !!job;
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Membuat task baru yang terhubung ke sebuah JobApplication.
 *
 * @param userId           - ID user yang sedang login
 * @param jobApplicationId - ID job yang menjadi parent task ini
 * @param payload          - Data task
 */
export async function createTask(
  userId: string,
  jobApplicationId: string | undefined,
  payload: TaskPayload
): Promise<ActionResult<{ id: string; title: string; status: TaskStatus }>> {
  try {
    if (!userId) {
      return { success: false, error: "userId wajib diisi." };
    }
    if (!payload.title?.trim()) {
      return { success: false, error: "Judul task tidak boleh kosong." };
    }

    // Pastikan job ini milik user yang bersangkutan (jika ada)
    if (jobApplicationId) {
      const isOwner = await verifyJobOwnership(userId, jobApplicationId);
      if (!isOwner) {
        return { success: false, error: "Job application tidak ditemukan atau bukan milik kamu." };
      }
    }

    // Sync Supabase Auth user ke Prisma User table (FK constraint)
    await upsertUser(userId);

    const task = await prisma.task.create({
      data: {
        userId,
        ...(jobApplicationId && { jobApplicationId }),
        title: payload.title.trim(),
        description: payload.description,
        status: payload.status ?? "TODO",
        priority: payload.priority ?? "MEDIUM",
        category: payload.category ?? "PERSONAL",
        deadline: payload.deadline,
        estimatedDays: payload.estimatedDays,
        isGroupProject: payload.isGroupProject ?? false,
        notes: payload.notes,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    revalidatePath("/jobs");
    return { success: true, data: task };
  } catch (error) {
    console.error("[createTask]", error);
    return { success: false, error: "Gagal membuat task." };
  }
}



// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Mengambil SEMUA task milik seorang user (tanpa terikat job tertentu).
 * Diurutkan berdasarkan priority (URGENT → HIGH → MEDIUM → LOW),
 * lalu deadline terdekat.
 */
export async function getAllTasksByUser(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "userId wajib diisi." };
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        tags: true,
        attachments: true,
        checklist: true,
      },
      orderBy: [
        { deadline: "asc" },
        { createdAt: "asc" },
      ],
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error("[getAllTasksByUser]", error);
    return { success: false, error: "Gagal mengambil data tasks." };
  }
}

/**
 * Mengambil satu task secara detail beserta relasinya (tags, attachments, logs).
 */
export async function getTaskById(userId: string, taskId: string) {
  try {
    if (!userId || !taskId) {
      return { success: false, error: "userId dan taskId wajib diisi." };
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        tags: true,
        attachments: true,
        logs: {
          orderBy: { date: "desc" },
        },
        checklist: {
          orderBy: { order: "asc" },
        },
        jobApplication: {
          select: {
            id: true,
            company: true,
            position: true,
          },
        },
      },
    });

    if (!task) {
      return { success: false, error: "Task tidak ditemukan." };
    }

    return { success: true, data: task };
  } catch (error) {
    console.error("[getTaskById]", error);
    return { success: false, error: "Gagal mengambil detail task." };
  }
}

// ─────────────────────────────────────────────

/**
 * Mengambil semua task yang terhubung ke satu JobApplication.
 * Diurutkan berdasarkan priority (URGENT → HIGH → MEDIUM → LOW),
 * lalu deadline terdekat.
 */
export async function getTasksByJob(userId: string, jobApplicationId: string) {
  try {
    if (!userId || !jobApplicationId) {
      return { success: false, error: "userId dan jobApplicationId wajib diisi." };
    }

    // Ownership check
    const isOwner = await verifyJobOwnership(userId, jobApplicationId);
    if (!isOwner) {
      return { success: false, error: "Job application tidak ditemukan atau bukan milik kamu." };
    }

    const tasks = await prisma.task.findMany({
      where: { jobApplicationId, userId },
      orderBy: [
        { deadline: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        category: true,
        deadline: true,
        estimatedDays: true,
        isGroupProject: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error("[getTasksByJob]", error);
    return { success: false, error: "Gagal mengambil data tasks." };
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Update data task secara partial.
 * Ownership diverifikasi via userId + jobApplicationId.
 */
export async function updateTask(
  userId: string,
  taskId: string,
  payload: Partial<TaskPayload>
): Promise<ActionResult<{ id: string; status: TaskStatus; priority: Priority }>> {
  try {
    // Cari task dan pastikan milik user ini
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true, jobApplicationId: true },
    });

    if (!existing) {
      return { success: false, error: "Task tidak ditemukan atau bukan milik kamu." };
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(payload.title?.trim()        && { title: payload.title.trim() }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.status               && { status: payload.status }),
        ...(payload.priority             && { priority: payload.priority }),
        ...(payload.category             && { category: payload.category }),
        ...(payload.deadline !== undefined && { deadline: payload.deadline }),
        ...(payload.estimatedDays !== undefined && { estimatedDays: payload.estimatedDays }),
        ...(payload.isGroupProject !== undefined && { isGroupProject: payload.isGroupProject }),
        ...(payload.notes !== undefined && { notes: payload.notes }),
      },
      select: {
        id: true,
        status: true,
        priority: true,
      },
    });

    revalidatePath("/jobs");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateTask]", error);
    return { success: false, error: "Gagal mengupdate task." };
  }
}

// ─────────────────────────────────────────────
// TOGGLE COMPLETE
// ─────────────────────────────────────────────

/**
 * Toggle status task antara DONE dan TODO.
 * Berguna untuk checkbox "tandai selesai" di UI.
 *
 * Logic:
 *   status saat ini DONE  → toggle ke TODO
 *   status selain DONE    → toggle ke DONE
 */
export async function toggleTaskComplete(
  userId: string,
  taskId: string
): Promise<ActionResult<{ id: string; status: TaskStatus }>> {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true, status: true },
    });

    if (!existing) {
      return { success: false, error: "Task tidak ditemukan atau bukan milik kamu." };
    }

    const newStatus: TaskStatus =
      existing.status === "DONE" ? "TODO" : "DONE";

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      select: { id: true, status: true },
    });

    revalidatePath("/jobs");
    return { success: true, data: updated };
  } catch (error) {
    console.error("[toggleTaskComplete]", error);
    return { success: false, error: "Gagal mengubah status task." };
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Menghapus task berdasarkan ID.
 * Ownership check dilakukan sebelum delete.
 */
export async function deleteTask(
  userId: string,
  taskId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: "Task tidak ditemukan atau bukan milik kamu." };
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath("/jobs");
    return { success: true, data: { id: taskId } };
  } catch (error) {
    console.error("[deleteTask]", error);
    return { success: false, error: "Gagal menghapus task." };
  }
}

// ─────────────────────────────────────────────
// TASK LOGS (Daily Progress)
// ─────────────────────────────────────────────

export async function addTaskLog(
  userId: string,
  taskId: string,
  content: string,
  lectureNumber?: number
) {
  try {
    // Verifikasi task milik user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      return { success: false, error: "Task tidak ditemukan." };
    }

    const log = await prisma.taskLog.create({
      data: {
        taskId,
        content,
        lectureNumber,
        date: new Date(),
      },
    });

    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, data: log };
  } catch (error) {
    console.error("[addTaskLog]", error);
    return { success: false, error: "Gagal menambah catatan progres." };
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST ACTIONS
// TaskChecklist: sub-task list dalam sebuah Task
// Kolom: id, taskId, title, done (bool), order (int)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tambah item checklist baru ke sebuah task.
 * Order otomatis = jumlah item yang sudah ada.
 */
export async function addChecklistItem(
  userId: string,
  taskId: string,
  title: string
) {
  try {
    // Verifikasi task milik user
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return { success: false, error: "Task tidak ditemukan." };

    // Hitung order = jumlah item yang sudah ada
    const count = await prisma.taskChecklist.count({ where: { taskId } });

    const item = await prisma.taskChecklist.create({
      data: { taskId, title: title.trim(), done: false, order: count },
    });

    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, data: item };
  } catch (error) {
    console.error("[addChecklistItem]", error);
    return { success: false, error: "Gagal menambah checklist item." };
  }
}

/**
 * Toggle done/undone satu item checklist.
 */
export async function toggleChecklistItem(
  userId: string,
  taskId: string,
  itemId: string
) {
  try {
    // Verifikasi task milik user
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return { success: false, error: "Task tidak ditemukan." };

    // Ambil state saat ini
    const item = await prisma.taskChecklist.findUnique({ where: { id: itemId } });
    if (!item) return { success: false, error: "Checklist item tidak ditemukan." };

    const updated = await prisma.taskChecklist.update({
      where: { id: itemId },
      data: { done: !item.done },
    });

    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("[toggleChecklistItem]", error);
    return { success: false, error: "Gagal update checklist item." };
  }
}

/**
 * Hapus satu item checklist.
 */
export async function deleteChecklistItem(
  userId: string,
  taskId: string,
  itemId: string
) {
  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return { success: false, error: "Task tidak ditemukan." };

    await prisma.taskChecklist.delete({ where: { id: itemId } });

    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true };
  } catch (error) {
    console.error("[deleteChecklistItem]", error);
    return { success: false, error: "Gagal menghapus checklist item." };
  }
}