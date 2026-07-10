"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Pencil, Trash2, RefreshCw, Copy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RecordTypeBadge, ZoneTypeBadge } from "@/components/ui/Badge";
import { DNSRecordFormModal } from "@/components/records/DNSRecordFormModal";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { DNSRecord, HostedZone, Paginated, RECORD_TYPES, RecordType } from "@/lib/types";

const PAGE_SIZE = 10;

export default function HostedZoneDetailPage() {
  const params = useParams<{ id: string }>();
  const zoneId = params.id;
  const { notify } = useToast();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [data, setData] = useState<Paginated<DNSRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecordType | "">("");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState<DNSRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<DNSRecord | null>(null);

  const fetchZone = useCallback(async () => {
    try {
      const res = await api.get<HostedZone>(`/api/hosted-zones/${zoneId}`);
      setZone(res.data);
    } catch {
      notify("Failed to load hosted zone", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Paginated<DNSRecord>>(`/api/hosted-zones/${zoneId}/records`, {
        params: {
          search: search || undefined,
          record_type: typeFilter || undefined,
          page,
          page_size: PAGE_SIZE,
        },
      });
      setData(res.data);
    } catch {
      notify("Failed to load records", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId, search, typeFilter, page]);

  useEffect(() => {
    fetchZone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    const t = setTimeout(fetchRecords, 250);
    return () => clearTimeout(t);
  }, [fetchRecords]);

  const refreshAll = () => {
    fetchZone();
    fetchRecords();
  };

  const handleCreate = async (form: {
    name: string;
    record_type: RecordType;
    value: string;
    ttl: number;
    routing_policy: string;
  }) => {
    await api.post(`/api/hosted-zones/${zoneId}/records`, form);
    setShowCreate(false);
    notify(`Record "${form.name}" (${form.record_type}) created`);
    refreshAll();
  };

  const handleEdit = async (form: {
    name: string;
    record_type: RecordType;
    value: string;
    ttl: number;
    routing_policy: string;
  }) => {
    if (!editRecord) return;
    await api.put(`/api/hosted-zones/${zoneId}/records/${editRecord.id}`, form);
    notify(`Record "${form.name}" updated`);
    setEditRecord(null);
    refreshAll();
  };

  const handleDelete = async () => {
    if (!deleteRecord) return;
    try {
      await api.delete(`/api/hosted-zones/${zoneId}/records/${deleteRecord.id}`);
      notify(`Record "${deleteRecord.name}" deleted`);
      setDeleteRecord(null);
      refreshAll();
    } catch {
      notify("Failed to delete record", "error");
    }
  };

  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[
          { label: "Route 53" },
          { label: "Hosted zones", href: "/hosted-zones" },
          { label: zone?.domain_name ?? "..." },
        ]}
        title={zone?.domain_name ?? "Loading..."}
        description={zone?.comment || undefined}
        actions={
          zone && (
            <>
              <ZoneTypeBadge type={zone.zone_type as "Public" | "Private"} />
              <Button variant="secondary" size="sm" onClick={refreshAll}>
                <RefreshCw size={14} />
              </Button>
              <Button variant="primary" onClick={() => setShowCreate(true)}>
                <Plus size={15} /> Create record
              </Button>
            </>
          )
        }
      />

      <div className="p-6">
        <div className="bg-white border border-[var(--aws-border)] rounded">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--aws-border)] gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search records by name or value" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as RecordType | "")}
                className="border border-[var(--aws-border)] rounded px-2.5 py-1.5 text-sm bg-white outline-none focus:border-[var(--aws-blue)]"
              >
                <option value="">All types</option>
                {RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-sm text-[var(--aws-text-secondary)]">
              {data ? `${data.total} record${data.total === 1 ? "" : "s"}` : ""}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-[var(--aws-text-secondary)]">
              Loading records...
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No records"
              description={
                search || typeFilter
                  ? "No records match your search or filter."
                  : "This hosted zone doesn't have any custom records yet."
              }
              action={
                !search && !typeFilter && (
                  <Button variant="primary" onClick={() => setShowCreate(true)}>
                    <Plus size={15} /> Create record
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[var(--aws-text-secondary)] border-b border-[var(--aws-border)] bg-[#fafbfb]">
                    <th className="px-4 py-2.5 font-medium">Record name</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Value</th>
                    <th className="px-4 py-2.5 font-medium">TTL</th>
                    <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((rec) => (
                    <tr
                      key={rec.id}
                      className="border-b border-[var(--aws-border)] last:border-0 hover:bg-[#fafbfb] align-top"
                    >
                      <td className="px-4 py-3 font-mono">{rec.name}</td>
                      <td className="px-4 py-3">
                        <RecordTypeBadge type={rec.record_type} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-pre-wrap max-w-md text-[var(--aws-text)]">
                        {rec.value}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{rec.ttl}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => navigator.clipboard.writeText(rec.value)}
                            aria-label="Copy value"
                            className="p-1.5 rounded hover:bg-gray-100 text-[var(--aws-text-secondary)] hover:text-[var(--aws-blue)]"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => setEditRecord(rec)}
                            aria-label="Edit"
                            className="p-1.5 rounded hover:bg-gray-100 text-[var(--aws-text-secondary)] hover:text-[var(--aws-blue)]"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteRecord(rec)}
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

      {showCreate && zone && (
        <DNSRecordFormModal
          domainSuffix={zone.domain_name}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
      {editRecord && zone && (
        <DNSRecordFormModal
          domainSuffix={zone.domain_name}
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSubmit={handleEdit}
        />
      )}
      {deleteRecord && (
        <ConfirmDialog
          title="Delete record"
          message={
            <>
              Are you sure you want to delete the{" "}
              <span className="font-mono font-semibold">{deleteRecord.record_type}</span> record{" "}
              <span className="font-mono font-semibold">{deleteRecord.name}</span>? This action
              cannot be undone.
            </>
          }
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteRecord(null)}
        />
      )}
    </AppShell>
  );
}
