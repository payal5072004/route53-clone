const RECORD_TYPE_COLORS: Record<string, string> = {
  A: "bg-[#e9f5e9] text-[var(--aws-green)]",
  AAAA: "bg-[#e9f5e9] text-[var(--aws-green)]",
  CNAME: "bg-[#e7f1fc] text-[var(--aws-blue)]",
  MX: "bg-[#fff9e6] text-[var(--aws-yellow)]",
  TXT: "bg-[#f2f3f3] text-[var(--aws-text-secondary)]",
  NS: "bg-[#f2e9fc] text-[#8b3ddb]",
  PTR: "bg-[#fdf3f1] text-[#c05e07]",
  SRV: "bg-[#e7f1fc] text-[var(--aws-blue)]",
  CAA: "bg-[#fdf3f1] text-[var(--aws-red)]",
};

export function RecordTypeBadge({ type }: { type: string }) {
  const cls = RECORD_TYPE_COLORS[type] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-semibold ${cls}`}
    >
      {type}
    </span>
  );
}

export function ZoneTypeBadge({ type }: { type: "Public" | "Private" }) {
  const cls =
    type === "Public"
      ? "bg-[#e9f5e9] text-[var(--aws-green)]"
      : "bg-[#f2e9fc] text-[#8b3ddb]";
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {type}
    </span>
  );
}
