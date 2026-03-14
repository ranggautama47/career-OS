// src/components/ui/input.tsx

import React, { forwardRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type InputVariant = "default" | "filled";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  variant?: InputVariant;
  containerClassName?: string;
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

// ── Input ──────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      containerClassName = "",
      className = "",
      id,
      ...props
    },
    ref
  ) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    const baseInput = [
      "w-full bg-white/[0.04] border rounded-xl px-3.5 py-2.5",
      "text-white text-sm placeholder:text-slate-600",
      "transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-0",
      error
        ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/15"
        : "border-white/8 hover:border-white/12 focus:border-indigo-500/50 focus:ring-indigo-500/15 focus:bg-indigo-500/[0.03]",
      leftIcon ? "pl-10" : "",
      rightElement ? "pr-10" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={["flex flex-col gap-1.5", containerClassName].join(" ")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-slate-400 text-xs font-medium tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input ref={ref} id={inputId} className={baseInput} {...props} />

          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-slate-600 text-xs">{hint}</p>
        )}
      </div>
    );
  }
);

// ── Textarea ───────────────────────────────────────────────────────────────

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, containerClassName = "", className = "", id, ...props },
    ref
  ) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={["flex flex-col gap-1.5", containerClassName].join(" ")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-slate-400 text-xs font-medium tracking-wide"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={[
            "w-full bg-white/[0.04] border rounded-xl px-3.5 py-2.5",
            "text-white text-sm placeholder:text-slate-600",
            "transition-all duration-200 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/15"
              : "border-white/8 hover:border-white/12 focus:border-indigo-500/50 focus:ring-indigo-500/15",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {error && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-slate-600 text-xs">{hint}</p>
        )}
      </div>
    );
  }
);

// ── Select ─────────────────────────────────────────────────────────────────

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      hint,
      options,
      placeholder,
      containerClassName = "",
      className = "",
      id,
      ...props
    },
    ref
  ) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={["flex flex-col gap-1.5", containerClassName].join(" ")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-slate-400 text-xs font-medium tracking-wide"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={inputId}
          className={[
            "w-full bg-[#0f1628] border rounded-xl px-3.5 py-2.5 pr-9",
            "text-white text-sm",
            "transition-all duration-200 appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/15"
              : "border-white/8 hover:border-white/12 focus:border-indigo-500/50 focus:ring-indigo-500/15",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-slate-600 text-xs">{hint}</p>
        )}
      </div>
    );
  }
);

export default Input;