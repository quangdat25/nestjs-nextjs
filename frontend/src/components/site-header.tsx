"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/src/context/auth-context";
import { useCart } from "@/src/context/cart-context";

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { user, loading, logout } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className={`site-header ${transparent ? "header-transparent" : ""}`}>
      <Link className="brand" href="/">
        <span className="brand-mark">B</span>
        <span>Bếp Mây</span>
      </Link>
      <nav aria-label="Điều hướng chính">
        <Link className={pathname === "/" ? "active" : ""} href="/#menu">Thực đơn</Link>
        {user && <Link className={pathname === "/orders" ? "active" : ""} href="/orders">Đơn của tôi</Link>}
        {user?.role === "ADMIN" && <Link href="/admin">Quản trị</Link>}
      </nav>
      <div className="header-actions">
        {!loading && (user ? (
          <div className="user-menu">
            <button className="user-trigger" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}>
              <span>{user.name.slice(0, 1).toUpperCase()}</span>
              <small>{user.name}</small>
            </button>
            {menuOpen && (
              <div className="user-dropdown">
                <div><b>{user.name}</b><small>{user.email}</small></div>
                <Link href="/orders" onClick={() => setMenuOpen(false)}>Đơn hàng của tôi</Link>
                {user.role === "ADMIN" && <Link href="/admin" onClick={() => setMenuOpen(false)}>Trang quản trị</Link>}
                <button onClick={() => void handleLogout()}>Đăng xuất</button>
              </div>
            )}
          </div>
        ) : <Link className="login-link" href="/auth/login">Đăng nhập</Link>)}
        <Link className="cart-button" href="/cart" aria-label={`Giỏ hàng có ${count} món`}>
          Giỏ hàng <span>{count}</span>
        </Link>
      </div>
    </header>
  );
}
