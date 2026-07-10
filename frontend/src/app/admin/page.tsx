"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, formatDate, formatMoney } from "@/src/lib/api";
import type { DashboardStats, Order, OrderStatus } from "@/src/lib/types";

const statusLabel: Record<OrderStatus, string> = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PREPARING: "Đang làm", DELIVERING: "Đang giao", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy" };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api<DashboardStats>("orders/admin/stats"), api<Order[]>("orders/admin/all")])
      .then(([statsData, ordersData]) => { if (active) { setStats(statsData); setOrders(ordersData); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const maxPopular = useMemo(() => Math.max(...(stats?.popularItems.map((item) => item.quantity) ?? [1]), 1), [stats]);
  if (loading) return <div className="admin-page"><div className="admin-loader">Đang tổng hợp hoạt động cửa hàng...</div></div>;

  const cards = [
    { label: "Doanh thu hoàn tất", value: formatMoney(stats?.revenue ?? 0), note: "Tổng doanh thu", icon: "₫", tone: "orange" },
    { label: "Đơn hôm nay", value: String(stats?.todayOrders ?? 0), note: `${stats?.totalOrders ?? 0} đơn toàn thời gian`, icon: "▤", tone: "green" },
    { label: "Chờ xác nhận", value: String(stats?.pendingOrders ?? 0), note: "Cần xử lý sớm", icon: "◷", tone: "yellow" },
    { label: "Điểm hài lòng", value: "4.9/5", note: "Từ khách hàng", icon: "★", tone: "cream" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-title"><div><span>TỔNG QUAN CỬA HÀNG</span><h1>Chào buổi sáng! 👋</h1><p>Mọi hoạt động của Bếp Mây đang được cập nhật tại đây.</p></div><Link className="admin-primary" href="/admin/orders">Xem đơn đang chờ</Link></div>
      <div className="stats-grid">{cards.map((card) => <article className={`stat-card ${card.tone}`} key={card.label}><div><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></div><b>{card.icon}</b></article>)}</div>
      <div className="dashboard-grid">
        <section className="admin-card recent-orders"><header><div><span>ĐƠN GẦN ĐÂY</span><h2>Hoạt động mới nhất</h2></div><Link href="/admin/orders">Xem tất cả →</Link></header>{orders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Thời gian</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>{orders.slice(0, 6).map((order) => <tr key={order._id}><td><b>#{order.orderCode}</b></td><td>{order.customerName}<small>{order.phone}</small></td><td>{formatDate(order.createdAt)}</td><td><strong>{formatMoney(order.total)}</strong></td><td><span className={`status status-${order.status.toLowerCase()}`}>{statusLabel[order.status]}</span></td></tr>)}</tbody></table></div> : <div className="admin-empty">Chưa có đơn hàng mới.</div>}</section>
        <aside className="admin-card popular-card"><header><div><span>MÓN ĐƯỢC YÊU THÍCH</span><h2>Top bán chạy</h2></div></header><div className="popular-list">{stats?.popularItems.length ? stats.popularItems.map((item, index) => <div key={item._id}><b>{index + 1}</b><p><span>{item._id}</span><small>{item.quantity} phần • {formatMoney(item.revenue)}</small></p><i><span style={{ width: `${item.quantity / maxPopular * 100}%` }} /></i></div>) : <div className="admin-empty">Dữ liệu sẽ có sau đơn hoàn tất đầu tiên.</div>}</div></aside>
      </div>
    </div>
  );
}
