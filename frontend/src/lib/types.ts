export type UserRole = "USER" | "ADMIN";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
}

export type ProductCategory = "COFFEE" | "TEA" | "FOOD" | "SNACK";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  icon: string;
  color: string;
  image?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  soldCount: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "DELIVERING" | "COMPLETED" | "CANCELLED";

export interface OrderItem {
  productId: string;
  name: string;
  icon: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "COD" | "BANK_TRANSFER";
  status: OrderStatus;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  revenue: number;
  popularItems: Array<{ _id: string; quantity: number; revenue: number }>;
}
