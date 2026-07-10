"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/src/context/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirm) return setError("Mật khẩu xác nhận chưa khớp");
    setSubmitting(true);
    setError("");
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      router.replace("/");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể đăng ký");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page auth-register-page">
      <Link className="auth-brand brand" href="/"><span className="brand-mark">B</span><span>Bếp Mây</span></Link>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          <div className="form-heading"><span>THÀNH VIÊN MỚI</span><h1>Tạo tài khoản</h1><p>Đăng ký để đặt món nhanh và theo dõi từng đơn hàng.</p></div>
          {error && <div className="form-error">{error}</div>}
          <label>Họ và tên<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nguyễn Minh Anh" required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="ban@example.com" required autoComplete="email" /></label>
          <div className="field-row">
            <label>Mật khẩu<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} /></label>
            <label>Xác nhận<input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required minLength={6} /></label>
          </div>
          <button className="primary-button form-submit" disabled={submitting}>{submitting ? "Đang tạo..." : "Tạo tài khoản"}</button>
          <p className="form-switch">Đã có tài khoản? <Link href="/auth/login">Đăng nhập</Link></p>
        </form>
      </section>
      <aside className="auth-art register-art"><div className="auth-art-copy"><span>CHÀO BẠN ĐẾN BẾP</span><h2>Mỗi ngày một món,<br />mỗi món một niềm vui.</h2><p>Tích lũy lịch sử đơn và đặt lại món yêu thích chỉ trong vài giây.</p></div><div className="auth-bowl">🥗</div></aside>
    </main>
  );
}
