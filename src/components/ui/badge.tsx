// src/components/ui/badge.tsx
// Dipakai untuk: JobStatus, TaskStatus, Priority, tags

import React from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "ghost";

type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
}

// ── Variant styles ─────────────────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-slate-700/60 text-slate-300 border border-slate-600/40",
  primary:
    "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",
  success:
    "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  warning:
    "bg-amber-500/15 text-amber-300 border border-amber-500/25",
  danger:
    "bg-red-500/15 text-red-300 border border-red-500/25",
  info:
    "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25",
  ghost:
    "bg-white/5 text-slate-400 border border-white/8",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-slate-400",
  primary: "bg-indigo-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-cyan-400",
  ghost: "bg-slate-500",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1 rounded-md",
  md: "px-2.5 py-1 text-xs gap-1.5 rounded-lg",
};

// ── JobStatus → Badge variant mapping ─────────────────────────────────────

export const jobStatusVariant: Record<string, BadgeVariant> = {
  APPLIED: "primary",
  INTERVIEW: "warning",
  OFFER: "success",
  REJECTED: "danger",
  GHOSTED: "ghost",
};

export const jobStatusLabel: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer 🎉",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
};

export const priorityVariant: Record<string, BadgeVariant> = {
  LOW: "ghost",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "danger",
};

// ── Component ──────────────────────────────────────────────────────────────

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  icon,
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-semibold leading-none select-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {dot && (
        <span
          className={[
            "rounded-full flex-shrink-0",
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
            dotColors[variant],
          ].join(" ")}
        />
      )}
      {!dot && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// ── Convenience exports ────────────────────────────────────────────────────

export function JobStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={jobStatusVariant[status] ?? "default"} dot size="md">
      {jobStatusLabel[status] ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const labels: Record<string, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "🔴 Urgent",
  };
  return (
    <Badge variant={priorityVariant[priority] ?? "default"} size="sm">
      {labels[priority] ?? priority}
    </Badge>
  );
}

export default Badge;