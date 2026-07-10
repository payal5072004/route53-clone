"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ComingSoon } from "@/components/ui/EmptyState";

export default function Page() {
  return (
    <AppShell>
      <PageHeader title="Resolver" />
      <ComingSoon feature="Resolver" />
    </AppShell>
  );
}
