"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DNSRecord, RECORD_TYPES, RecordType } from "@/lib/types";

interface DNSRecordFormModalProps {
  domainSuffix: string; // the zone's domain name, appended for display help
  record?: DNSRecord | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    record_type: RecordType;
    value: string;
    ttl: number;
    routing_policy: string;
  }) => Promise<void>;
}

const VALUE_HELP: Partial<Record<RecordType, string>> = {
  A: "One IPv4 address per line, e.g. 192.0.2.1",
  AAAA: "One IPv6 address per line, e.g. 2001:db8::1",
  CNAME: "A single hostname, e.g. target.example.com",
  TXT: "One quoted string per line, e.g. \"v=spf1 -all\"",
  MX: "Priority and mail server, e.g. 10 mail.example.com",
  NS: "One name server per line",
  PTR: "The domain name this pointer resolves to",
  SRV: "Priority, weight, port, target, e.g. 10 5 5060 sipserver.example.com",
  CAA: "Flags, tag and value, e.g. 0 issue \"letsencrypt.org\"",
};

export function DNSRecordFormModal({
  domainSuffix,
  record,
  onClose,
  onSubmit,
}: DNSRecordFormModalProps) {
  const isEdit = !!record;
  const [name, setName] = useState(record?.name ?? domainSuffix);
  const [recordType, setRecordType] = useState<RecordType>(record?.record_type ?? "A");
  const [value, setValue] = useState(record?.value ?? "");
  const [ttl, setTtl] = useState(record?.ttl ?? 300);
  const [routingPolicy] = useState(record?.routing_policy ?? "Simple");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        record_type: recordType,
        value: value.trim(),
        ttl: Number(ttl),
        routing_policy: routingPolicy,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit record" : "Create record"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !value.trim()}
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create record"}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-[var(--aws-text)] mb-1">
            Record name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={domainSuffix}
            className="w-full border border-[var(--aws-border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)] font-mono"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--aws-text)] mb-1">
              Record type
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as RecordType)}
              className="w-full border border-[var(--aws-border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)] bg-white"
            >
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--aws-text)] mb-1">
              TTL (seconds)
            </label>
            <input
              type="number"
              min={0}
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value))}
              className="w-full border border-[var(--aws-border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--aws-text)] mb-1">Value</label>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder={VALUE_HELP[recordType]}
            className="w-full border border-[var(--aws-border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)] font-mono"
            required
          />
          {VALUE_HELP[recordType] && (
            <p className="text-xs text-[var(--aws-text-secondary)] mt-1">{VALUE_HELP[recordType]}</p>
          )}
        </div>

        {error && (
          <div className="text-sm text-[var(--aws-red)] bg-[var(--aws-red-bg)] border border-[var(--aws-red)]/30 rounded px-3 py-2">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
