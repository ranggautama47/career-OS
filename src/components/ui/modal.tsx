"use client";

// src/components/ui/modal.tsx
// Accessible modal dengan focus trap, Escape key, dan backdrop click

import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

// ── Types ──────────────────────────────────────────────────────────────────

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

// ── Size classes ───────────────────────────────────────────────────────────

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-4xl",
};

// ── Component ──────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  closeOnBackdrop = true,
  showCloseButton = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    // Focus panel
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          "relative w-full z-10",
          "bg-[#0d1120] border border-white/10",
          "rounded-2xl shadow-2xl shadow-black/50",
          "flex flex-col max-h-[90vh]",
          sizeClasses[size],
        ].join(" ")}
        style={{ outline: "none" }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/6 flex-shrink-0">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-white font-semibold text-base tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-slate-500 text-sm mt-0.5">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Tutup modal"
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-all duration-150 -mr-1 -mt-0.5"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/6 flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render ke document.body via portal
  return createPortal(modalContent, document.body);
}

// ── Confirm Modal (convenience wrapper) ───────────────────────────────────

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const btnClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20"
      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20";

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/8 border border-white/8 transition-all disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={[
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
            btnClass,
          ].join(" ")}
        >
          {loading && (
            <svg
              className="animate-spin h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
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
          )}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;