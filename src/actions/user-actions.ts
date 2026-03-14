"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";


export async function deleteUserAccount() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 1. Dapatkan session user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User tidak ditemukan atau belum login." };
    }

    // 2. Hapus data dari Prisma
    // Karena kamu sudah pakai onDelete: Cascade di schema, 
    // ini akan otomatis menghapus JobApplication, Task, dan Note milik user ini.
    await prisma.user.delete({
      where: { id: user.id }
    });

    // 3. Hapus user dari Supabase Auth
    // Kita butuh Admin Client (Service Role) untuk menghapus user dari sistem Auth
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Pastikan key ini ada di .env kamu
    );

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (authError) {
      console.error("[deleteUserAccount - Auth]", authError);
      return { success: false, error: "Data terhapus, tapi gagal menghapus akun Auth." };
    }

    // 4. Logout user dengan menghapus cookies session (Optional tapi disarankan)
    await supabase.auth.signOut();
    
    return { success: true };
  } catch (error) {
    console.error("[deleteUserAccount]", error);
    return { success: false, error: "Terjadi kesalahan sistem saat menghapus akun." };
  }
}