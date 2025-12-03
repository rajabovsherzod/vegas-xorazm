/**
 * Application Constants
 * 
 * Barcha magic numbers va strings uchun centralized constants.
 * Bu faylni o'zgartirish orqali butun app ni boshqarish mumkin.
 */

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

// ============================================================================
// CURRENCY
// ============================================================================

export const CURRENCY = {
  UZS: 'UZS',
  USD: 'USD',
} as const;

export const CURRENCY_SYMBOLS = {
  UZS: "so'm",
  USD: '$',
} as const;

export const DEFAULT_USD_RATE = '12800';

// ============================================================================
// ORDER STATUS
// ============================================================================

export const ORDER_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.DRAFT]: 'Kutilmoqda',
  [ORDER_STATUS.COMPLETED]: 'Yakunlandi',
  [ORDER_STATUS.CANCELLED]: 'Bekor qilindi',
  [ORDER_STATUS.REFUNDED]: 'Qaytarildi',
} as const;

// ============================================================================
// ORDER TYPE
// ============================================================================

export const ORDER_TYPE = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale',
} as const;

export const ORDER_TYPE_LABELS = {
  [ORDER_TYPE.RETAIL]: 'Chakana',
  [ORDER_TYPE.WHOLESALE]: 'Ulgurji',
} as const;

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  DEBT: 'debt',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.CASH]: 'Naqd',
  [PAYMENT_METHOD.CARD]: 'Karta',
  [PAYMENT_METHOD.TRANSFER]: "O'tkazma",
  [PAYMENT_METHOD.DEBT]: 'Nasiya',
} as const;

// ============================================================================
// USER ROLES
// ============================================================================

export const USER_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SELLER: 'seller',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLE.OWNER]: 'Egasi',
  [USER_ROLE.ADMIN]: 'Admin',
  [USER_ROLE.SELLER]: 'Sotuvchi',
} as const;

// ============================================================================
// PRODUCT UNITS
// ============================================================================

export const PRODUCT_UNIT = {
  DONA: 'dona',
  KG: 'kg',
  LITR: 'litr',
  METR: 'metr',
  QUTI: 'quti',
} as const;

export const PRODUCT_UNIT_LABELS = {
  [PRODUCT_UNIT.DONA]: 'Dona',
  [PRODUCT_UNIT.KG]: 'Kilogram',
  [PRODUCT_UNIT.LITR]: 'Litr',
  [PRODUCT_UNIT.METR]: 'Metr',
  [PRODUCT_UNIT.QUTI]: 'Quti',
} as const;

// ============================================================================
// STOCK THRESHOLDS
// ============================================================================

export const STOCK_THRESHOLD = {
  LOW: 10,
  CRITICAL: 5,
  OUT_OF_STOCK: 0,
} as const;

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMAT = {
  DISPLAY: 'dd.MM.yyyy',
  DISPLAY_WITH_TIME: 'dd.MM.yyyy HH:mm',
  DISPLAY_FULL: 'dd MMMM yyyy, HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// ============================================================================
// QUERY KEYS (React Query)
// ============================================================================

export const QUERY_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: 'product',
  CATEGORIES: 'categories',
  CATEGORY: 'category',
  ORDERS: 'orders',
  ORDER: 'order',
  SELLER_ORDERS: 'seller-orders',
  USERS: 'users',
  USER: 'user',
  DASHBOARD_STATS: 'dashboard-stats',
  DAILY_SALES: 'daily-sales',
  TOP_PRODUCTS: 'top-products',
  TOP_SELLERS: 'top-sellers',
  CATEGORY_SALES: 'category-sales',
} as const;

// ============================================================================
// SOCKET EVENTS
// ============================================================================

export const SOCKET_EVENTS = {
  // Server -> Client
  NEW_ORDER: 'new_order',
  STOCK_UPDATE: 'stock_update',
  ORDER_STATUS_CHANGE: 'order_status_change',
  NEW_PRODUCT: 'new_product',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',

  // Client -> Server
  JOIN_ADMIN: 'join_admin',
  LEAVE_ADMIN: 'leave_admin',
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_WIDTH_COLLAPSED: 80,
  HEADER_HEIGHT: 64,
  MOBILE_HEADER_HEIGHT: 56,
  MAX_CONTENT_WIDTH: 1600,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
} as const;

// ============================================================================
// VALIDATION
// ============================================================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_PRODUCT_NAME_LENGTH: 2,
  MAX_PRODUCT_NAME_LENGTH: 255,
  MIN_CATEGORY_NAME_LENGTH: 2,
  MAX_CATEGORY_NAME_LENGTH: 255,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Tarmoq xatoligi. Internetni tekshiring.',
  SERVER_ERROR: 'Server xatoligi. Keyinroq qayta urinib ko\'ring.',
  UNAUTHORIZED: 'Tizimga kirish uchun login qiling.',
  FORBIDDEN: 'Sizda bu amalni bajarish huquqi yo\'q.',
  NOT_FOUND: 'Ma\'lumot topilmadi.',
  VALIDATION_ERROR: 'Ma\'lumotlarni to\'g\'ri kiriting.',
  CONFLICT: 'Bu ma\'lumot allaqachon mavjud.',
  UNKNOWN_ERROR: 'Noma\'lum xatolik yuz berdi.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Mahsulot muvaffaqiyatli qo\'shildi',
  PRODUCT_UPDATED: 'Mahsulot muvaffaqiyatli yangilandi',
  PRODUCT_DELETED: 'Mahsulot muvaffaqiyatli o\'chirildi',
  CATEGORY_CREATED: 'Kategoriya muvaffaqiyatli qo\'shildi',
  CATEGORY_UPDATED: 'Kategoriya muvaffaqiyatli yangilandi',
  CATEGORY_DELETED: 'Kategoriya muvaffaqiyatli o\'chirildi',
  ORDER_CREATED: 'Buyurtma muvaffaqiyatli yaratildi',
  ORDER_CONFIRMED: 'Buyurtma tasdiqlandi',
  ORDER_CANCELLED: 'Buyurtma bekor qilindi',
  USER_CREATED: 'Xodim muvaffaqiyatli qo\'shildi',
  USER_UPDATED: 'Xodim ma\'lumotlari yangilandi',
  USER_DELETED: 'Xodim o\'chirildi',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  // Owner
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_STAFF: '/owner/staff',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',

  // Seller
  SELLER_POS: '/seller/pos',
  SELLER_COMPLETED: '/seller/completed',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type OrderType = typeof ORDER_TYPE[keyof typeof ORDER_TYPE];
export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];
export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];
export type Currency = typeof CURRENCY[keyof typeof CURRENCY];
export type ProductUnit = typeof PRODUCT_UNIT[keyof typeof PRODUCT_UNIT];

