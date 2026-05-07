// src/app/dashboard/layout.tsx
// Sidebar fixed full-height, main content offset dengan lg:ml-60

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
    <div className="flex bg-[#0a0f1e]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}