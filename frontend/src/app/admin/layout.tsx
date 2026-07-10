"use client";

import { AdminShell } from "@/src/components/admin-shell";
import { AuthGuard } from "@/src/components/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard role="ADMIN"><AdminShell>{children}</AdminShell></AuthGuard>;
}
