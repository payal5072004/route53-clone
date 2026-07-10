"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Globe, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ZoneTypeBadge } from "@/components/ui/Badge";
import { HostedZoneFormModal } from "@/components/zones/HostedZoneFormModal";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { HostedZone, Paginated } from "@/lib/types";

const PAGE_SIZE = 10;

export default function HostedZonesPage() {
  const { notify } = useToast();
  const [data, setData] = useState<Paginated<HostedZone> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editZone, setEditZone] = useState<HostedZone | null>(null);
  const [deleteZone, setDeleteZone] = useState<HostedZone | null>(null);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Paginated<HostedZone>>("/api/hosted-zones", {
        params: { search: search || undefined, page, page_size: PAGE_SIZE },
      });
      setData(res.data);
    } catch {
      notify("Failed to load hosted zones", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  // debounce search
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchZones, 250);
    return () => clearTimeout(t);
  }, [fetchZones]);

  const handleCreate = async (form: { domain_name: string; comment: string; zone_type: "Public" | "Private" }) => {
    await api.post("/api/hosted-zones", form);
    setShowCreate(false);
    notify(`Hosted zone "${form.domain_name}" created`);
    fetchZones();
  };

  const handleEdit = async (form: { domain_name: string; comment: string; zone_type: "Public" | "Private" }) => {
    if (!editZone) return;
    await api.put(`/api/hosted-zones/${editZone.id}`, {
      comment: form.comment,
      zone_type: form.zone_type,
    });
    setEditZone(null);
    notify(`Hosted zone "${editZone.domain_name}" updated`);
    fetchZones();
  };

  const handleDelete = async () => {
    if (!deleteZone) return;
    try {
      await api.delete(`/api/hosted-zones/${deleteZone.id}`);
      notify(`Hosted zone "${deleteZone.domain_name}" deleted`);
      setDeleteZone(null);
      fetchZones();
    } catch {
      notify("Failed to delete hosted zone", "error");
    }
  };

  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[{ label: "Route 53" }, { label: "Hosted zones" }]}
        title="Hosted zones"
        description="A hosted zone is a container for records, which include information about how you want to route traffic for a domain."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={fetchZones}>
              <RefreshCw size={14} />
            </Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Create hosted zone
            </Button>
          </>
        }
      />

      <div className="p-6">
        <div className="bg-white border border-[var(--aws-border)] rounded">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--aws-border)]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search hosted zones by domain name"
            />
            <span className="text-sm text-[var(--aws-text-secondary)]">
              {data ? `${data.total} hosted zone${data.total === 1 ? "" : "s"}` : ""}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-[var(--aws-text-secondary)]">
              Loading hosted zones...
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No hosted zones"
              description={
                search
                  ? `No hosted zones match "${search}".`
                  : "You don't have any hosted zones yet. Create one to start managing DNS records."
              }
              action={
                !search && (
                  <Button variant="primary" onClick={() => setShowCreate(true)}>
                    <Plus size={15} /> Create hosted zone
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[var(--aws-text-secondary)] border-b border-[var(--aws-border)] bg-[#fafbfb]">
                    <th className="px-4 py-2.5 font-medium">Domain name</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Record count</th>
                    <th className="px-4 py-2.5 font-medium">Description</th>
                    <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((zone) => (
                    <tr
                      key={zone.id}
                      className="border-b border-[var(--aws-border)] last:border-0 hover:bg-[#fafbfb]"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/hosted-zones/${zone.id}`}
                          className="flex items-center gap-2 text-[var(--aws-blue)] hover:underline font-medium"
                        >
                          <Globe size={14} className="shrink-0" />
                          {zone.domain_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <ZoneTypeBadge type={zone.zone_type as "Public" | "Private"} />
                      </td>
                      <td className="px-4 py-3 tabular-nums">{zone.record_count}</td>
                      <td className="px-4 py-3 text-[var(--aws-text-secondary)] max-w-xs truncate">
                        {zone.comment || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditZone(zone)}
                            aria-label="Edit"
                            className="p-1.5 rounded hover:bg-gray-100 text-[var(--aws-text-secondary)] hover:text-[var(--aws-blue)]"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteZone(zone)}
                            aria-label="Delete"
                            className="p-1.5 rounded hover:bg-gray-100 text-[var(--aws-text-secondary)] hover:text-[var(--aws-red)]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && data.total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
          )}
        </div>
      </div>

      {showCreate && (
        <HostedZoneFormModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
      )}
      {editZone && (
        <HostedZoneFormModal
          zone={editZone}
          onClose={() => setEditZone(null)}
          onSubmit={handleEdit}
        />
      )}
      {deleteZone && (
        <ConfirmDialog
          title="Delete hosted zone"
          message={
            <>
              Are you sure you want to delete{" "}
              <span className="font-mono font-semibold">{deleteZone.domain_name}</span>? This
              will permanently delete the hosted zone and all {deleteZone.record_count} record
              {deleteZone.record_count === 1 ? "" : "s"} inside it. This action cannot be undone.
            </>
          }
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteZone(null)}
        />
      )}
    </AppShell>
  );
}
