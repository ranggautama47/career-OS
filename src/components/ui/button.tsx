// src/components/ui/button.tsx

import React from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ── Variant styles ─────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700",
    "text-white",
    "border border-transparent",
    "shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30",
  ].join(" "),

  secondary: [
    "bg-white/5 hover:bg-white/10 active:bg-white/[0.03]",
    "text-slate-300 hover:text-white",
    "border border-white/10 hover:border-white/20",
  ].join(" "),

  ghost: [
    "bg-transparent hover:bg-white/5",
    "text-slate-400 hover:text-slate-200",
    "border border-transparent",
  ].join(" "),

  danger: [
    "bg-red-600/10 hover:bg-red-600/20 active:bg-red-600/30",
    "text-red-400 hover:text-red-300",
    "border border-red-500/20 hover:border-red-500/30",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-base gap-2.5 rounded-xl",
};

// ── Spinner ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        // Base
        "inline-flex items-center justify-center font-semibold",
        "transition-all duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        // Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        // Width
        fullWidth ? "w-full" : "",
        // Variant + size
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

export default Button;