"use client";

// src/components/shared/Sidebar.tsx
// Fix: ikon benar, warna slate-blue, responsif dengan mobile hamburger

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Brain,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

// ── Nav items ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    accent: "indigo",
  },
  {
    href: "/dashboard/jobs",
    label: "Job Tracker",
    icon: Briefcase,
    exact: false,
    accent: "violet",
  },
  {
    href: "/dashboard/tasks",
    label: "Tasks",
    icon: CheckSquare,
    exact: false,
    accent: "amber",
  },
  {
    href: "/dashboard/notes",
    label: "Smart Notes",
    icon: Brain,
    exact: false,
    accent: "emerald",
  },
  {
    href: "/dashboard/ai",
    label: "AI Tools",
    icon: Sparkles,
    exact: false,
    accent: "cyan",
  },
] as const;

// ── Active accent classes (static strings so Tailwind v4 scanner can detect) ──
// IMPORTANT: Each class string must be written as a full static literal.
// Do NOT use template literals or dynamic concatenation for Tailwind classes.

function getActiveClasses(accent: string) {
  switch (accent) {
    case "indigo":
      return {
        container: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
        icon: "text-indigo-300",
        dot: "bg-indigo-400",
      };
    case "violet":
      return {
        container: "bg-violet-500/15 text-violet-300 border-violet-500/25",
        icon: "text-violet-300",
        dot: "bg-violet-400",
      };
    case "amber":
      return {
        container: "bg-amber-500/15 text-amber-300 border-amber-500/25",
        icon: "text-amber-300",
        dot: "bg-amber-400",
      };
    case "emerald":
      return {
        container: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        icon: "text-emerald-300",
        dot: "bg-emerald-400",
      };
    case "cyan":
      return {
        container: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
        icon: "text-cyan-300",
        dot: "bg-cyan-400",
      };
    default:
      return {
        container: "bg-slate-500/15 text-slate-300 border-slate-500/25",
        icon: "text-slate-300",
        dot: "bg-slate-400",
      };
  }
}

// ── Sidebar content (shared antara desktop & mobile) ──────────────────────

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="px-4 py-5 border-b border-slate-700/50">
        <Link
          href="/dashboard"
          onClick={onNavClick}
          className="flex items-center gap-3 group"
        >
          {/* Logo image — tanpa background */}
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Image
              src="/careeros-logo.jpg"
              alt="CareerOS"
              width={32}
              height={32}
              className="object-contain"
              onError={() => {
                // handled by next/image fallback
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[15px] text-white tracking-tight leading-none">
              Career<span className="text-indigo-400">OS</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
              Career Dashboard
            </p>
          </div>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em] px-2 mb-3">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            const accentClasses = getActiveClasses(item.accent);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                    "transition-all duration-150 border",
                    active
                      ? accentClasses.container
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/40 border-transparent",
                  ].join(" ")}
                >
                  <Icon
                    size={16}
                    className={[
                      "flex-shrink-0 transition-colors",
                      active ? accentClasses.icon : "text-slate-500",
                    ].join(" ")}
                  />
                  <span className="truncate flex-1">{item.label}</span>
                  {active && (
                    <span
                      className={[
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        accentClasses.dot,
                      ].join(" ")}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Logout ── */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-slate-500 hover:text-red-400 hover:bg-red-500/10
            border border-transparent hover:border-red-500/20
            transition-all duration-150 disabled:opacity-40"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span>{loggingOut ? "Keluar..." : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Sidebar ───────────────────────────────────────────────────────────

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 flex items-center justify-center
          rounded-xl bg-slate-800 border border-slate-700 text-slate-300
          hover:bg-slate-700 hover:text-white transition-colors shadow-lg"
        aria-label="Buka menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={[
          "lg:hidden fixed top-0 left-0 z-50 h-full w-64",
          "bg-slate-900 border-r border-slate-700/60 shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center
            rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Tutup menu"
        >
          <X size={15} />
        </button>

        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0 bg-slate-900 border-r border-slate-700/60">
        <SidebarContent />
      </aside>
    </>
  );
}
