// src/components/ui/card.tsx

import React from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type CardVariant = "default" | "bordered" | "ghost" | "elevated";
type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  as?: React.ElementType;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

// ── Styles ─────────────────────────────────────────────────────────────────

const variantClasses: Record<CardVariant, string> = {
  default:
    "bg-white/[0.03] border border-white/8 rounded-2xl",
  bordered:
    "bg-transparent border border-white/12 rounded-2xl",
  ghost:
    "bg-transparent border-none rounded-2xl",
  elevated:
    "bg-slate-900/80 border border-white/10 rounded-2xl shadow-xl shadow-black/30",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

// ── Card ───────────────────────────────────────────────────────────────────

export function Card({
  variant = "default",
  padding = "md",
  hoverable = false,
  as: Tag = "div",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <Tag
      className={[
        variantClasses[variant],
        paddingClasses[padding],
        hoverable
          ? "transition-all duration-200 hover:bg-white/[0.05] hover:border-white/15 cursor-pointer hover:-translate-y-0.5"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ── Card Header ────────────────────────────────────────────────────────────

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className = "",
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-4 mb-4",
        className,
      ].join(" ")}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Card Footer ────────────────────────────────────────────────────────────

export function CardFooter({
  bordered = true,
  children,
  className = "",
  ...props
}: CardFooterProps) {
  return (
    <div
      className={[
        "mt-4 pt-4 flex items-center justify-between gap-3",
        bordered ? "border-t border-white/6" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;