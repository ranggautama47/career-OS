// src/app/layout.tsx
import "./globals.css"; // Pastikan path ini benar sesuai lokasi CSS kamu
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CareerOS — Platform Karir & Akademik",
  description: "Kelola lamaran kerja dan tugas kuliah dalam satu tempat.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}