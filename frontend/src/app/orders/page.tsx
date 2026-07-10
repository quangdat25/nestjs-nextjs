"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/src/components/auth-guard";
import { SiteHeader } from "@/src/components/site-header";
import { api, formatDate, formatMoney } from "@/src/lib/api";
import type { Order, OrderStatus } from "@/src/lib/types";

const statusLabel: Record<OrderStatus, string> = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PREPARING: "Đang chuẩn bị", DELIVERING: "Đang giao", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy" };

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api<Order[]>("orders/my").then((data) => { if (active) setOrders(data); }).catch(() => { if (active) setOrders([]); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <div className="page-container orders-container"><div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><b>Đơn hàng</b></div><div className="page-title"><span>HÀNH TRÌNH MÓN NGON</span><h1>Đơn hàng của tôi</h1><p>Theo dõi trạng thái và xem lại những món bạn đã chọn.</p></div>{loading ? <div className="page-loader">Đang tải đơn hàng...</div> : !orders.length ? <div className="empty-state cart-empty"><span>🧾</span><h3>Bạn chưa có đơn hàng nào</h3><p>Món ngon đầu tiên đang chờ bạn khám phá.</p><Link className="primary-button" href="/#menu">Đặt món ngay</Link></div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><header><div><span>ĐƠN #{order.orderCode}</span><small>{formatDate(order.createdAt)}</small></div><b className={`status status-${order.status.toLowerCase()}`}>{statusLabel[order.status]}</b></header><div className="order-items">{order.items.map((item) => <div key={item.productId}><span>{item.icon}</span><p><b>{item.name}</b><small>{item.quantity} × {formatMoney(item.price)}</small></p></div>)}</div><footer><div><small>Giao đến</small><p>{order.address}</p></div><div><small>Tổng cộng</small><strong>{formatMoney(order.total)}</strong></div></footer></article>)}</div>}</div>;
}

export default function OrdersPage() {
  return <main className="inner-page"><SiteHeader /><AuthGuard><OrdersContent /></AuthGuard></main>;
}
