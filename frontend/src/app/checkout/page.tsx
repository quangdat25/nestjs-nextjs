"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthGuard } from "@/src/components/auth-guard";
import { SiteHeader } from "@/src/components/site-header";
import { useAuth } from "@/src/context/auth-context";
import { useCart } from "@/src/context/cart-context";
import { api, formatMoney } from "@/src/lib/api";
import type { Order } from "@/src/lib/types";

function CheckoutContent() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({ customerName: user?.name ?? "", phone: user?.phone ?? "", address: user?.address ?? "", note: "", paymentMethod: "COD" as "COD" | "BANK_TRANSFER" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const deliveryFee = subtotal >= 120000 ? 0 : 15000;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!items.length) return setError("Giỏ hàng của bạn đang trống");
    setSubmitting(true);
    setError("");
    try {
      const created = await api<Order>("orders", { method: "POST", body: JSON.stringify({ ...form, items: items.map((item) => ({ productId: item._id, quantity: item.quantity })) }) });
      clearCart();
      setOrder(created);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tạo đơn hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) return (
    <div className="success-card"><div className="success-icon">✓</div><span>ĐẶT MÓN THÀNH CÔNG</span><h1>Cảm ơn bạn!</h1><p>Đơn <b>#{order.orderCode}</b> đã được Bếp Mây tiếp nhận. Chúng mình sẽ sớm xác nhận và chuẩn bị món.</p><div><small>Tổng thanh toán</small><strong>{formatMoney(order.total)}</strong></div><Link className="primary-button" href="/orders">Theo dõi đơn hàng</Link><Link href="/">Về trang chủ</Link></div>
  );

  return (
    <div className="page-container checkout-container">
      <div className="breadcrumbs"><Link href="/cart">Giỏ hàng</Link><span>/</span><b>Thông tin giao hàng</b></div>
      <div className="page-title compact"><span>CHỈ CÒN MỘT BƯỚC</span><h1>Hoàn tất đơn hàng</h1></div>
      <form className="checkout-layout" onSubmit={(event) => void submit(event)}>
        <section className="checkout-form-card"><div className="card-heading"><b>1</b><div><h2>Thông tin nhận hàng</h2><p>Bếp Mây sẽ giao đến địa chỉ này</p></div></div>{error && <div className="form-error">{error}</div>}<div className="field-row"><label>Họ và tên<input value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} required /></label><label>Số điện thoại<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></label></div><label>Địa chỉ giao hàng<textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required rows={3} /></label><label>Ghi chú cho Bếp<textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} rows={2} placeholder="Ví dụ: ít đá, không hành..." /></label><div className="card-heading second"><b>2</b><div><h2>Phương thức thanh toán</h2></div></div><div className="payment-options"><label className={form.paymentMethod === "COD" ? "selected" : ""}><input type="radio" checked={form.paymentMethod === "COD"} onChange={() => setForm({ ...form, paymentMethod: "COD" })} /><span>💵</span><div><b>Thanh toán khi nhận hàng</b><small>Tiền mặt hoặc chuyển khoản cho tài xế</small></div></label><label className={form.paymentMethod === "BANK_TRANSFER" ? "selected" : ""}><input type="radio" checked={form.paymentMethod === "BANK_TRANSFER"} onChange={() => setForm({ ...form, paymentMethod: "BANK_TRANSFER" })} /><span>🏦</span><div><b>Chuyển khoản ngân hàng</b><small>Thông tin chuyển khoản sau khi đặt món</small></div></label></div></section>
        <aside className="order-summary checkout-summary"><span>ĐƠN CỦA BẠN</span><h2>{items.length} món</h2><div className="checkout-items">{items.map((item) => <div key={item._id}><span style={{ backgroundColor: item.color }}>{item.icon}<i>{item.quantity}</i></span><p>{item.name}<small>{formatMoney(item.price)}</small></p></div>)}</div><div><p>Tạm tính <b>{formatMoney(subtotal)}</b></p><p>Phí giao hàng <b>{deliveryFee ? formatMoney(deliveryFee) : "Miễn phí"}</b></p></div><p className="summary-total">Tổng cộng <strong>{formatMoney(subtotal + deliveryFee)}</strong></p><button className="primary-button checkout-button" disabled={submitting}>{submitting ? "Đang gửi đơn..." : "Đặt món ngay"}</button></aside>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return <main className="inner-page"><SiteHeader /><AuthGuard><CheckoutContent /></AuthGuard></main>;
}
