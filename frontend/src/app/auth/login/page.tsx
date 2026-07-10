"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useAuth } from "@/src/context/auth-context";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await login(email, password);
      const requested = searchParams.get("next");
      const destination = requested?.startsWith("/") ? requested : user.role === "ADMIN" ? "/admin" : "/";
      router.replace(destination);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể đăng nhập");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={(event) => void submit(event)}>
      <div className="form-heading"><span>CHÀO MỪNG TRỞ LẠI</span><h1>Đăng nhập Bếp Mây</h1><p>Tiếp tục hành trình thưởng thức món ngon của bạn.</p></div>
      {error && <div className="form-error">{error}</div>}
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" required autoComplete="email" /></label>
      <label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tối thiểu 6 ký tự" required autoComplete="current-password" /></label>
      <button className="primary-button form-submit" disabled={submitting}>{submitting ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      <div className="demo-account"><b>Tài khoản Admin demo</b><span>admin@bepmay.vn / Admin@123</span></div>
      <p className="form-switch">Chưa có tài khoản? <Link href="/auth/register">Đăng ký ngay</Link></p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Link className="auth-brand brand" href="/"><span className="brand-mark">B</span><span>Bếp Mây</span></Link>
      <section className="auth-panel"><Suspense fallback={<div className="page-loader">Đang tải...</div>}><LoginForm /></Suspense></section>
      <aside className="auth-art">
        <div className="auth-art-copy"><span>BẾP NHỎ • VỊ NHÀ</span><h2>Ngon hơn khi<br />mình cùng sẻ chia.</h2><p>Hơn 2.000 khách hàng đã chọn Bếp Mây cho mỗi bữa ăn trong ngày.</p></div>
        <div className="auth-bowl">🍜</div><span className="auth-leaf leaf-one">🌿</span><span className="auth-leaf leaf-two">🍃</span>
      </aside>
    </main>
  );
}
