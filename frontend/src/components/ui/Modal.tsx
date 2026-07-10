"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export function Modal({ title, onClose, children, footer, width = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-10 px-4">
      <div
        className={`animate-modal-in w-full ${width} rounded bg-white shadow-xl border border-[var(--aws-border)]`}
      >
        <div className="flex items-center justify-between border-b border-[var(--aws-border)] px-5 py-4">
          <h2 className="text-lg font-semibold text-[var(--aws-text)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--aws-text-secondary)] hover:text-black rounded p-1 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--aws-border)] px-5 py-3 bg-[#fafbfb] rounded-b">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
