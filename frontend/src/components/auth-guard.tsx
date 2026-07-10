"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/context/auth-context";
import type { UserRole } from "@/src/lib/types";

export function AuthGuard({ children, role }: { children: React.ReactNode; role?: UserRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    else if (role && user.role !== role) router.replace("/");
  }, [loading, pathname, role, router, user]);

  if (loading || !user || (role && user.role !== role)) {
    return <div className="page-loader"><span className="loader-mark">B</span><p>Đang chuẩn bị...</p></div>;
  }
  return <>{children}</>;
}
