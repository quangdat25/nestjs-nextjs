"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/src/context/auth-context";

const navItems = [
  { href: "/admin", icon: "▦", label: "Tổng quan" },
  { href: "/admin/orders", icon: "▤", label: "Đơn hàng" },
  { href: "/admin/products", icon: "◈", label: "Thực đơn" },
  { href: "/admin/users", icon: "◎", label: "Khách hàng" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signOut = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <Link className="brand admin-brand" href="/"><span className="brand-mark">B</span><span>Bếp Mây<small>ADMIN SPACE</small></span></Link>
        <nav>{navItems.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return <Link className={active ? "active" : ""} href={item.href} key={item.href} onClick={() => setMobileOpen(false)}><span>{item.icon}</span>{item.label}</Link>;
        })}</nav>
        <div className="admin-help"><span>☁️</span><b>Cần hỗ trợ?</b><p>Xem hướng dẫn vận hành cửa hàng Bếp Mây.</p></div>
        <button className="sidebar-logout" onClick={() => void signOut()}>↪ Đăng xuất</button>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><button className="mobile-menu" onClick={() => setMobileOpen((value) => !value)}>☰</button><div><span className="live-dot" /> Cửa hàng đang mở</div><div className="admin-account"><span>{user?.name.slice(0, 1).toUpperCase()}</span><p><b>{user?.name}</b><small>Quản trị viên</small></p></div></header>
        {children}
      </section>
    </div>
  );
}
