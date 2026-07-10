"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { HostedZone } from "@/lib/types";

interface HostedZoneFormModalProps {
  zone?: HostedZone | null; // present => edit mode
  onClose: () => void;
  onSubmit: (data: {
    domain_name: string;
    comment: string;
    zone_type: "Public" | "Private";
  }) => Promise<void>;
}

export function HostedZoneFormModal({ zone, onClose, onSubmit }: HostedZoneFormModalProps) {
  const isEdit = !!zone;
  const [domainName, setDomainName] = useState(zone?.domain_name ?? "");
  const [comment, setComment] = useState(zone?.comment ?? "");
  const [zoneType, setZoneType] = useState<"Public" | "Private">(zone?.zone_type ?? "Public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ domain_name: domainName.trim(), comment, zone_type: zoneType });
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
      title={isEdit ? `Edit hosted zone` : "Create hosted zone"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting || !domainName.trim()}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create hosted zone"}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-[var(--aws-text)] mb-1">
            Domain name
          </label>
          <input
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            placeholder="example.com"
            disabled={isEdit}
            className="w-full border border-[var(--aws-border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)] disabled:bg-gray-100 font-mono"
            required
          />
          {isEdit && (
            <p className="text-xs text-[var(--aws-text-secondary)] mt-1">
              The domain name can&apos;t be changed after creation, just like real Route53.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--aws-text)] mb-1">
            Description — optional
          </label>
          <textarea
            value={comment ?? ""}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full border border-[var(--aws-border)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--aws-blue)] focus:ring-1 focus:ring-[var(--aws-blue)]"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-[var(--aws-text)] mb-1.5">Type</span>
          <div className="flex gap-4">
            {(["Public", "Private"] as const).map((t) => (
              <label key={t} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="zone_type"
                  checked={zoneType === t}
                  onChange={() => setZoneType(t)}
                  className="accent-[var(--aws-blue)]"
                />
                {t} hosted zone
              </label>
            ))}
          </div>
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
