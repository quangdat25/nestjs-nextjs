"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/src/components/site-header";
import { useCart } from "@/src/context/cart-context";
import { api, formatMoney } from "@/src/lib/api";
import type { Product, ProductCategory } from "@/src/lib/types";

const heroItems = [
  { icon: "☕", name: "Cà phê muối", price: "35.000đ", tone: "coffee" },
  { icon: "🍗", name: "Cơm gà nướng", price: "59.000đ", tone: "rice" },
  { icon: "🍑", name: "Trà đào cam sả", price: "42.000đ", tone: "tea" },
];

const categories: Array<{ value: "ALL" | ProductCategory; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "COFFEE", label: "Cà phê" },
  { value: "TEA", label: "Trà & nước" },
  { value: "FOOD", label: "Món no" },
  { value: "SNACK", label: "Ăn nhẹ" },
];

export default function Home() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"ALL" | ProductCategory>("ALL");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api<Product[]>("products")
      .then((data) => { if (active) setProducts(data); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "ALL" || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [category, products, search]);

  const handleAdd = (product: Product) => {
    addItem(product);
    setNotice(`Đã thêm ${product.name} vào giỏ`);
    window.setTimeout(() => setNotice(""), 1800);
  };

  return (
    <main>
      {notice && <div className="toast-notice">✓ {notice}</div>}
      <div className="announcement"><span>Freeship đơn từ 120K trong bán kính 3km</span><span>•</span><span>Mở cửa 07:00 — 22:00</span></div>
      <SiteHeader transparent />

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">BẾP NHỎ • VỊ NHÀ</span>
          <h1>Một bữa ngon,<br />ngay khi bạn cần.</h1>
          <p>Cà phê thơm, trà mát và những món ăn nóng hổi được chuẩn bị mỗi ngày từ nguyên liệu tươi mới.</p>
          <div className="hero-actions">
            <Link className="primary-button" href="#menu">Xem thực đơn</Link>
            <span className="rating"><b>4.9</b> ★★★★★ <small>hơn 2.000 lượt yêu thích</small></span>
          </div>
          <div className="category-row" aria-label="Danh mục nổi bật"><span>☕ Cà phê</span><span>🧋 Trà & nước</span><span>🍚 Món no</span><span>🥐 Ăn nhẹ</span></div>
        </div>
        <div className="hero-showcase" aria-label="Món bán chạy">
          <div className="showcase-orbit orbit-one" /><div className="showcase-orbit orbit-two" />
          <div className="showcase-label">Bán chạy<br /><strong>tuần này</strong></div>
          {heroItems.map((item, index) => (
            <article className={`floating-product product-${index + 1}`} key={item.name}>
              <div className={`food-visual ${item.tone}`}>{item.icon}</div><div><h2>{item.name}</h2><p>{item.price}</p></div>
              <Link aria-label={`Xem ${item.name}`} href="#menu">+</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="promise-strip" id="about">
        <div><b>30 phút</b><span>Giao nhanh tận cửa</span></div><div><b>Mỗi ngày</b><span>Nguyên liệu tươi mới</span></div><div><b>4.9/5</b><span>Khách hàng yêu thích</span></div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading"><div><span>THỰC ĐƠN HÔM NAY</span><h2>Chọn món bạn thích</h2></div><p>Từ ly cà phê buổi sáng đến bữa tối ấm bụng — Bếp Mây luôn có một món dành cho bạn.</p></div>
        <div className="menu-toolbar">
          <div className="menu-tabs">{categories.map((item) => <button className={category === item.value ? "active" : ""} key={item.value} onClick={() => setCategory(item.value)}>{item.label}</button>)}</div>
          <label className="menu-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm món ngon..." /></label>
        </div>
        {loading ? (
          <div className="product-grid">{Array.from({ length: 4 }).map((_, index) => <div className="product-card product-skeleton" key={index} />)}</div>
        ) : filteredProducts.length ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product._id}>
                <div className="product-image" style={{ backgroundColor: product.color }}><span>{product.icon}</span>{product.isFeatured && <b>Bán chạy</b>}</div>
                <div className="product-info"><div className="product-title-row"><h3>{product.name}</h3><span>★ 4.{Math.min(9, 5 + product.soldCount % 5)}</span></div><p>{product.description}</p><div className="product-bottom"><strong>{formatMoney(product.price)}</strong><button onClick={() => handleAdd(product)} aria-label={`Thêm ${product.name}`}>+</button></div></div>
              </article>
            ))}
          </div>
        ) : <div className="empty-state"><span>🍽️</span><h3>Chưa tìm thấy món phù hợp</h3><p>Thử một từ khóa hoặc danh mục khác nhé.</p></div>}
      </section>

      <section className="story-section">
        <div className="story-visual"><span className="story-dish">🥘</span><div className="story-badge"><b>100%</b><small>nấu mới mỗi ngày</small></div></div>
        <div className="story-copy"><span>CHUYỆN CỦA BẾP</span><h2>Món ngon bắt đầu từ điều tử tế.</h2><p>Bếp Mây chọn nguyên liệu theo mùa, nấu từng mẻ nhỏ và chỉ bắt đầu chuẩn bị khi bạn đặt món. Vì chúng mình tin rằng một bữa ăn ngon cũng là cách dịu dàng để chăm sóc nhau.</p><div className="story-points"><div><b>✓</b><span><strong>Nguyên liệu rõ nguồn gốc</strong><small>Ưu tiên nhà cung cấp địa phương</small></span></div><div><b>✓</b><span><strong>Không chất bảo quản</strong><small>Nấu mới và dùng trong ngày</small></span></div></div></div>
      </section>

      <footer className="site-footer"><Link className="brand" href="/"><span className="brand-mark">B</span><span>Bếp Mây</span></Link><p>Đồ ăn & thức uống tươi mới mỗi ngày.</p><div><span>07:00 — 22:00</span><span>1900 6868</span><span>12 Nguyễn Huệ, TP.HCM</span></div></footer>
    </main>
  );
}
