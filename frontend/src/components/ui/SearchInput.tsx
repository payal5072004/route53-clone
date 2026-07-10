"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search" }: SearchInputProps) {
  return (
    <div className="flex items-center gap-2 border border-[var(--aws-border)] rounded bg-white px-2.5 py-1.5 w-full max-w-sm focus-within:border-[var(--aws-blue)] focus-within:ring-1 focus-within:ring-[var(--aws-blue)]">
      <Search size={14} className="text-[var(--aws-text-secondary)] shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="outline-none text-sm w-full"
      />
      {value && (
        <button onClick={() => onChange("")} className="text-[var(--aws-text-secondary)] hover:text-black">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
