"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "link";
  size?: "sm" | "md";
}

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--aws-blue)]";

  const sizes = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";

  const variants: Record<string, string> = {
    primary: "bg-[var(--aws-orange)] text-white hover:bg-[var(--aws-orange-hover)]",
    secondary:
      "bg-white text-[var(--aws-blue)] border border-[var(--aws-blue)] hover:bg-[#f0f7ff]",
    danger: "bg-[var(--aws-red)] text-white hover:bg-[#b01010]",
    link: "text-[var(--aws-blue)] hover:underline px-0 py-0",
  };

  return (
    <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...props} />
  );
}
