"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, formatDate, formatMoney } from "@/src/lib/api";
import type { Order, OrderStatus } from "@/src/lib/types";

const statuses: Array<{ value: "ALL" | OrderStatus; label: string }> = [
  { value: "ALL", label: "Tất cả" }, { value: "PENDING", label: "Chờ xác nhận" }, { value: "CONFIRMED", label: "Đã xác nhận" }, { value: "PREPARING", label: "Đang chuẩn bị" }, { value: "DELIVERING", label: "Đang giao" }, { value: "COMPLETED", label: "Hoàn tất" }, { value: "CANCELLED", label: "Đã hủy" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");

  const loadOrders = useCallback(() => api<Order[]>("orders/admin/all").then(setOrders).catch(() => setOrders([])), []);
  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const visibleOrders = useMemo(() => orders.filter((order) => (filter === "ALL" || order.status === filter) && `${order.orderCode} ${order.customerName} ${order.phone}`.toLowerCase().includes(search.toLowerCase())), [filter, orders, search]);

  const changeStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id); setError("");
    try {
      const updated = await api<Order>(`orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setOrders((current) => current.map((order) => order._id === id ? updated : order));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể cập nhật đơn"); }
    finally { setUpdating(""); }
  };

  return <div className="admin-page"><div className="admin-title"><div><span>QUẢN LÝ VẬN HÀNH</span><h1>Đơn hàng</h1><p>Xác nhận, chuẩn bị và theo dõi tiến độ giao món.</p></div></div>{error && <div className="form-error admin-error">{error}</div>}<div className="admin-filters"><div className="admin-tabs">{statuses.map((status) => <button className={filter === status.value ? "active" : ""} onClick={() => setFilter(status.value)} key={status.value}>{status.label}{status.value !== "ALL" && <span>{orders.filter((order) => order.status === status.value).length}</span>}</button>)}</div><label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã đơn, khách hàng..." /></label></div><section className="admin-card order-management"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Đơn hàng</th><th>Khách hàng & địa chỉ</th><th>Món</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>{visibleOrders.map((order) => <tr key={order._id}><td><b>#{order.orderCode}</b><small>{formatDate(order.createdAt)}</small></td><td>{order.customerName}<small>{order.phone} • {order.address}</small></td><td><div className="mini-items">{order.items.slice(0, 3).map((item) => <span key={item.productId} title={item.name}>{item.icon}<i>{item.quantity}</i></span>)}</div></td><td><strong>{formatMoney(order.total)}</strong><small>{order.paymentMethod === "COD" ? "Thanh toán khi nhận" : "Chuyển khoản"}</small></td><td><select value={order.status} disabled={updating === order._id || ["COMPLETED", "CANCELLED"].includes(order.status)} onChange={(event) => void changeStatus(order._id, event.target.value as OrderStatus)}>{statuses.slice(1).map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}</select></td></tr>)}</tbody></table>{!visibleOrders.length && <div className="admin-empty">Không có đơn phù hợp bộ lọc.</div>}</div></section></div>;
}
