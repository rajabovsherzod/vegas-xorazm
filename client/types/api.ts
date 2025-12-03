/**
 * API Types
 * 
 * Backend API bilan ishlash uchun barcha tiplar.
 * Bu faylda backend response va request tiplar aniqlanadi.
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * Standard API Response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: number;
  name: string;
  barcode: string;
  price: string;
  originalPrice: string | null;
  currency: 'UZS' | 'USD';
  stock: string;
  unit: string;
  categoryId: number | null;
  category?: Category;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateProductPayload {
  name: string;
  barcode: string;
  price: number;
  originalPrice?: number;
  currency: 'UZS' | 'USD';
  stock: number;
  unit?: string;
  categoryId?: number;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> { }

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> { }

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus = 'draft' | 'completed' | 'cancelled';
export type OrderType = 'retail' | 'wholesale';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'debt';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  quantity: string;
  price: string;
  originalCurrency: 'UZS' | 'USD';
  totalPrice: string;
  createdAt: Date | string;
}

export interface Order {
  id: number;
  sellerId: number;
  seller?: User;
  cashierId: number | null;
  cashier?: User;
  partnerId: number | null;
  partner?: Partner;
  customerName: string | null;
  totalAmount: string;
  finalAmount: string;
  currency: 'UZS' | 'USD';
  exchangeRate: string;
  status: OrderStatus;
  isPrinted: boolean;
  type: OrderType;
  paymentMethod: PaymentMethod;
  items?: OrderItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateOrderPayload {
  customerName?: string;
  type: OrderType;
  paymentMethod: PaymentMethod;
  exchangeRate: string;
  items: {
    productId: number;
    quantity: string;
  }[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'seller';

export interface User {
  id: number;
  fullName: string;
  username: string;
  role: UserRole;
  fixSalary: string;
  bonusPercent: string;
  finePerHour: string;
  workStartTime: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateUserPayload {
  fullName: string;
  username: string;
  password: string;
  role: UserRole;
  fixSalary?: number;
  bonusPercent?: number;
  finePerHour?: number;
  workStartTime?: string;
}

export interface UpdateUserPayload extends Partial<Omit<CreateUserPayload, 'password'>> {
  password?: string;
}

// ============================================================================
// PARTNER TYPES
// ============================================================================

export interface Partner {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  lowStockProducts: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  count: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface TopSeller {
  sellerId: number;
  sellerName: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface CategorySales {
  categoryId: number;
  categoryName: string;
  totalRevenue: number;
  percentage: number;
}

// ============================================================================
// SOCKET TYPES
// ============================================================================

export interface SocketNewOrderEvent {
  id: number;
  sellerId: number;
  customerName: string | null;
  totalAmount: string;
  createdAt: Date | string;
}

export interface SocketStockUpdateEvent {
  action: 'add' | 'subtract';
  items: {
    id: number;
    quantity: number;
  }[];
}

export interface SocketOrderStatusChangeEvent {
  id: number;
  status: OrderStatus;
}

