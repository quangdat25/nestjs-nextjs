"use client";

import Link from "next/link";
import { SiteHeader } from "@/src/components/site-header";
import { useCart } from "@/src/context/cart-context";
import { formatMoney } from "@/src/lib/api";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const deliveryFee = subtotal >= 120000 ? 0 : 15000;

  return (
    <main className="inner-page">
      <SiteHeader />
      <div className="page-container">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><b>Giỏ hàng</b></div>
        <div className="page-title"><span>ĐƠN HÀNG CỦA BẠN</span><h1>Giỏ hàng</h1><p>{items.length ? `${items.length} món đang chờ bạn` : "Chiếc giỏ nhỏ đang đợi một món ngon"}</p></div>
        {!items.length ? (
          <div className="empty-state cart-empty"><span>🧺</span><h3>Giỏ hàng còn trống</h3><p>Thực đơn hôm nay có nhiều món ngon lắm đó.</p><Link className="primary-button" href="/#menu">Khám phá thực đơn</Link></div>
        ) : (
          <div className="cart-layout">
            <section className="cart-list">
              {items.map((item) => (
                <article className="cart-item" key={item._id}>
                  <div className="cart-item-image" style={{ backgroundColor: item.color }}>{item.icon}</div>
                  <div className="cart-item-copy"><span>{item.category === "FOOD" ? "Món ăn" : "Thức uống"}</span><h2>{item.name}</h2><p>{item.description}</p><button onClick={() => removeItem(item._id)}>Xóa</button></div>
                  <div className="quantity-control"><button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button></div>
                  <strong>{formatMoney(item.price * item.quantity)}</strong>
                </article>
              ))}
              <Link className="continue-shopping" href="/#menu">← Chọn thêm món</Link>
            </section>
            <aside className="order-summary"><span>TÓM TẮT ĐƠN</span><h2>Thanh toán</h2><div><p>Tạm tính <b>{formatMoney(subtotal)}</b></p><p>Phí giao hàng <b>{deliveryFee ? formatMoney(deliveryFee) : "Miễn phí"}</b></p></div>{subtotal < 120000 && <small>Thêm {formatMoney(120000 - subtotal)} để được miễn phí giao hàng</small>}<p className="summary-total">Tổng cộng <strong>{formatMoney(subtotal + deliveryFee)}</strong></p><Link className="primary-button checkout-button" href="/checkout">Tiến hành đặt món</Link><em>Thanh toán an toàn • Xác nhận nhanh chóng</em></aside>
          </div>
        )}
      </div>
    </main>
  );
}
