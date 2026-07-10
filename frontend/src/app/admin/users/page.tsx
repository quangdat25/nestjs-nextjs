"use client";

import { useEffect, useMemo, useState } from "react";
import { api, formatDate } from "@/src/lib/api";
import type { User } from "@/src/lib/types";

interface UserResponse { results: User[]; meta: { total: number } }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api<UserResponse>("users?pageSize=100").then((data) => { if (active) setUsers(data.results); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const filtered = useMemo(() => users.filter((user) => `${user.name} ${user.email} ${user.phone ?? ""}`.toLowerCase().includes(search.toLowerCase())), [search, users]);
  const customers = users.filter((user) => user.role === "USER");

  return <div className="admin-page"><div className="admin-title"><div><span>CỘNG ĐỒNG BẾP MÂY</span><h1>Khách hàng</h1><p>Xem thông tin tài khoản và hoạt động thành viên.</p></div></div><div className="customer-summary"><article><span>◎</span><div><small>Tổng thành viên</small><strong>{customers.length}</strong></div></article><article><span>✦</span><div><small>Đang hoạt động</small><strong>{customers.filter((user) => user.isActive !== false).length}</strong></div></article><label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, email, số điện thoại..." /></label></div><section className="admin-card"><div className="admin-table-wrap"><table className="admin-table users-table"><thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Địa chỉ</th><th>Ngày tham gia</th><th>Trạng thái</th></tr></thead><tbody>{filtered.map((user) => <tr key={user._id}><td><div className="customer-cell"><span>{user.name.slice(0, 1).toUpperCase()}</span><p><b>{user.name}</b><small>{user.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}</small></p></div></td><td>{user.email}<small>{user.phone ?? "Chưa cập nhật SĐT"}</small></td><td>{user.address ?? "Chưa cập nhật"}</td><td>{user.createdAt ? formatDate(user.createdAt) : "—"}</td><td><span className={`status ${user.isActive === false ? "status-cancelled" : "status-completed"}`}>{user.isActive === false ? "Đã khóa" : "Hoạt động"}</span></td></tr>)}</tbody></table>{loading && <div className="admin-empty">Đang tải khách hàng...</div>}{!loading && !filtered.length && <div className="admin-empty">Không tìm thấy khách hàng.</div>}</div></section></div>;
}
