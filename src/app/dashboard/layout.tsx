// src/app/dashboard/layout.tsx
// Fix: hapus ml-64 hardcode, pakai lg:pl-0, responsif dengan mobile support

import type { Metadata } from "next";
import Sidebar from "@/components/shared/Sidebar";

export const metadata: Metadata = {
  title: "CareerOS",
  description: "Your unified career productivity platform",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      {/* Sidebar — hidden on mobile, sticky on desktop */}
      <Sidebar />

      {/* Main content */}
      {/* pt-16 on mobile biar tidak tertutup hamburger button */}
      {/* lg:pt-0 karena sidebar sudah di kiri */}
      <main className="flex-1 min-h-screen min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}