"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, formatMoney } from "@/src/lib/api";
import type { Product, ProductCategory } from "@/src/lib/types";

interface ProductForm {
  name: string;
  description: string;
  category: ProductCategory;
  price: string;
  icon: string;
  color: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

const emptyForm: ProductForm = { name: "", description: "", category: "COFFEE", price: "", icon: "☕", color: "#ead7bd", isAvailable: true, isFeatured: false };
const categoryLabel: Record<ProductCategory, string> = { COFFEE: "Cà phê", TEA: "Trà & nước", FOOD: "Món no", SNACK: "Ăn nhẹ" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"ALL" | ProductCategory>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api<Product[]>("products?includeUnavailable=true").then((data) => { if (active) setProducts(data); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => products.filter((product) => (category === "ALL" || product.category === category) && product.name.toLowerCase().includes(search.toLowerCase())), [category, products, search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setFormOpen(true); };
  const openEdit = (product: Product) => { setEditing(product); setForm({ name: product.name, description: product.description, category: product.category, price: String(product.price), icon: product.icon, color: product.color, isAvailable: product.isAvailable, isFeatured: product.isFeatured }); setError(""); setFormOpen(true); };

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    const payload = { ...form, price: Number(form.price) };
    try {
      if (editing) {
        const updated = await api<Product>(`products/${editing._id}`, { method: "PATCH", body: JSON.stringify(payload) });
        setProducts((current) => current.map((product) => product._id === updated._id ? updated : product));
      } else {
        const created = await api<Product>("products", { method: "POST", body: JSON.stringify(payload) });
        setProducts((current) => [created, ...current]);
      }
      setFormOpen(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể lưu món"); }
    finally { setSaving(false); }
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Xóa “${product.name}” khỏi thực đơn?`)) return;
    try { await api(`products/${product._id}`, { method: "DELETE" }); setProducts((current) => current.filter((item) => item._id !== product._id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không thể xóa món"); }
  };

  return (
    <div className="admin-page">
      <div className="admin-title"><div><span>QUẢN LÝ CATALOG</span><h1>Thực đơn</h1><p>Thêm món mới, cập nhật giá và trạng thái phục vụ.</p></div><button className="admin-primary" onClick={openCreate}>＋ Thêm món mới</button></div>
      {error && !formOpen && <div className="form-error admin-error">{error}</div>}
      <div className="admin-filters product-filters"><div className="admin-tabs"><button className={category === "ALL" ? "active" : ""} onClick={() => setCategory("ALL")}>Tất cả <span>{products.length}</span></button>{Object.entries(categoryLabel).map(([value, label]) => <button className={category === value ? "active" : ""} onClick={() => setCategory(value as ProductCategory)} key={value}>{label}<span>{products.filter((product) => product.category === value).length}</span></button>)}</div><label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên món..." /></label></div>
      <div className="admin-product-grid">{filtered.map((product) => <article className={`admin-product ${!product.isAvailable ? "unavailable" : ""}`} key={product._id}><div className="admin-product-image" style={{ backgroundColor: product.color }}><span>{product.icon}</span><div>{product.isFeatured && <b>Nổi bật</b>}{!product.isAvailable && <b className="off">Tạm hết</b>}</div></div><div className="admin-product-info"><span>{categoryLabel[product.category]}</span><h2>{product.name}</h2><p>{product.description}</p><div><strong>{formatMoney(product.price)}</strong><small>Đã bán {product.soldCount}</small></div><footer><button onClick={() => openEdit(product)}>Sửa món</button><button className="danger" onClick={() => void remove(product)}>Xóa</button></footer></div></article>)}</div>
      {!filtered.length && <div className="admin-empty admin-card">Không tìm thấy món phù hợp.</div>}
      {formOpen && <div className="modal-backdrop" onMouseDown={() => setFormOpen(false)}><form className="product-modal" onSubmit={(event) => void submit(event)} onMouseDown={(event) => event.stopPropagation()}><header><div><span>{editing ? "CẬP NHẬT MÓN" : "MÓN MỚI"}</span><h2>{editing ? editing.name : "Thêm vào thực đơn"}</h2></div><button type="button" onClick={() => setFormOpen(false)}>×</button></header>{error && <div className="form-error">{error}</div>}<div className="modal-grid"><label>Tên món<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Danh mục<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ProductCategory })}>{Object.entries(categoryLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Giá bán (VNĐ)<input type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label><label>Biểu tượng<input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} /></label><label className="full">Mô tả<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label><label>Màu nền<input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label><div className="toggle-group"><label><input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })} /> Đang phục vụ</label><label><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} /> Món nổi bật</label></div></div><footer><button type="button" onClick={() => setFormOpen(false)}>Hủy</button><button className="admin-primary" disabled={saving}>{saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm món"}</button></footer></form></div>}
    </div>
  );
}
