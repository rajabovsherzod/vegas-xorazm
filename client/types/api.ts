/**
 * API Types (Updated for "Beton" Schema)
 * * Backend API bilan ishlash uchun barcha tiplar.
 * Yangi Chegirma, Vozvrat va Stock History tizimlariga moslashtirildi.
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

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
  categoryId: number | null;
  category?: Category;
  
  // Narxlar (Backendda decimal -> string bo'lib keladi)
  price: string;          // Hozirgi sotuv narxi (agar aksiya bo'lsa, aksiya narxi)
  originalPrice: string | null; // Kelish narxi yoki asl narx
  
  // Chegirma ma'lumotlari
  discountPrice: string | null;
  discountStart: string | null; // ISO Date string
  discountEnd: string | null;   // ISO Date string

  currency: 'UZS' | 'USD';
  stock: string;
  unit: string;
  image: string | null;
  
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateProductPayload extends Partial<Omit<CreateProductPayload, 'stock'>> {
  // Stock bu yerdan o'zgarmaydi, faqat Add Stock orqali
}

// Chegirma belgilash uchun payload
export interface SetDiscountPayload {
  percent?: number;
  fixedPrice?: number;
  startDate?: string | Date;
  endDate: string | Date;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> { }

// ============================================================================
// ORDER TYPES
// ============================================================================

// 🔥 Yangi statuslar qo'shildi
export type OrderStatus = 'draft' | 'completed' | 'cancelled' | 'fully_refunded' | 'partially_refunded';
export type OrderType = 'retail' | 'wholesale';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'debt';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  
  quantity: string;
  
  // Narxlar
  price: string;          // Sotilgan narxi (chegirma bilan bo'lishi mumkin)
  originalPrice: string;  // Asl narxi (manual discountni hisoblash uchun)
  totalPrice: string;
  
  createdAt?: string;
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
  
  // Summalar
  totalAmount: string;    // Chegirmasiz jami// Umumiy chegirma
  finalAmount: string;    // To'langan summa

  discountAmount: string;       // Natija (masalan "50000")
  discountValue: string;        // Kiritilgan qiymat (masalan "10" yoki "50000")
  discountType: 'percent' | 'fixed'; // Turi
  
  currency: 'UZS' | 'USD';
  exchangeRate: string;
  
  status: OrderStatus;
  isPrinted: boolean;
  type: OrderType;
  paymentMethod: PaymentMethod;
  
  items?: OrderItem[];
  refunds?: Refund[]; // Shu orderga tegishli vozvratlar
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customerName?: string;
  type: OrderType;
  paymentMethod: PaymentMethod;
  exchangeRate: string;
  // Umumiy chegirma (ixtiyoriy)
  discountAmount?: number; 
  items: {
    productId: number;
    quantity: string;
    // Manual narx (agar kassir narxni qo'lda o'zgartirsa)
    customPrice?: number; 
  }[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

// ============================================================================
// REFUND TYPES (YANGI)
// ============================================================================

export interface Refund {
  id: number;
  orderId: number;
  totalAmount: string;
  reason: string | null;
  refundedBy: number; // User ID
  refundedByUser?: User; // Expand qilinganda
  items?: RefundItem[];
  createdAt: string;
}

export interface RefundItem {
  id: number;
  refundId: number;
  productId: number;
  product?: Product;
  quantity: string;
  price: string;
}

export interface CreateRefundPayload {
  orderId: number;
  reason?: string;
  items: {
    productId: number;
    quantity: number; // Qancha qaytaryapti
  }[];
}

// ============================================================================
// STOCK HISTORY TYPES (YANGI)
// ============================================================================

export interface StockHistory {
  id: number;
  productId: number;
  product?: Product;
  quantity: string;
  oldStock: string | null;
  newStock: string | null;
  newPrice: string | null;
  
  // AddedBy obyekt sifatida
  addedBy: {
    id: number;
    fullName: string;
    username: string;
    role: UserRole;
  } | null;
  
  note: string | null;
  createdAt: string;
}

export interface AddStockPayload {
  quantity: number;
  newPrice?: number;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'cashier' | 'seller' | 'developer';

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
  createdAt: string;
  updatedAt: string;
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
  balance: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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
  // Refund statistikasi
  totalRefunds?: number; 
  refundedAmount?: number;
}

// ... Qolgan statistika tiplari o'zgarishsiz qolishi mumkin ...

// ============================================================================
// SOCKET TYPES
// ============================================================================

export interface SocketNewOrderEvent {
  id: number;
  sellerId: number;
  customerName: string | null;
  totalAmount: string;
  createdAt: string;
}

export interface SocketStockUpdateEvent {
  action: 'add' | 'subtract' | 'refresh';
  items: {
    id: number;
    quantity: number;
  }[];
}

export interface SocketOrderStatusChangeEvent {
  id: number;
  status: OrderStatus;
}

export interface SocketProductUpdateEvent {
  id: number;
  name: string;
  price: string;
  stock: string;
  // Yangilangan chegirma info
  discountPrice?: string;
}