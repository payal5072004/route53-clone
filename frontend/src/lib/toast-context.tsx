"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const iconFor = (variant: ToastVariant) => {
    if (variant === "success") return <CheckCircle2 size={18} className="text-[var(--aws-green)]" />;
    if (variant === "error") return <XCircle size={18} className="text-[var(--aws-red)]" />;
    return <Info size={18} className="text-[var(--aws-blue)]" />;
  };

  const bgFor = (variant: ToastVariant) => {
    if (variant === "success") return "bg-[var(--aws-green-bg)] border-[var(--aws-green)]";
    if (variant === "error") return "bg-[var(--aws-red-bg)] border-[var(--aws-red)]";
    return "bg-white border-[var(--aws-blue)]";
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in flex items-start gap-2 rounded border px-3 py-2.5 shadow-md text-sm ${bgFor(
              t.variant
            )}`}
          >
            {iconFor(t.variant)}
            <span className="flex-1 text-[var(--aws-text)]">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-[var(--aws-text-secondary)] hover:text-black">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
