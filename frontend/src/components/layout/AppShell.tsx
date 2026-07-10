"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { TopNav } from "./TopNav";
import { SideNav } from "./SideNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { username, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !username) {
      router.replace("/login");
    }
  }, [isLoading, username, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen text-sm text-[var(--aws-text-secondary)]">
        Loading...
      </div>
    );
  }

  if (!username) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <div className="flex flex-1 min-h-0">
        <SideNav />
        <main className="flex-1 overflow-y-auto bg-[var(--aws-bg)]">{children}</main>
      </div>
    </div>
  );
}
