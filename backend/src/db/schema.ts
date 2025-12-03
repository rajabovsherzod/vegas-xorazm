import { pgTable, serial, text, integer, decimal, timestamp, varchar, boolean, pgEnum, time, date, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMLAR ---
export const currencyEnum = pgEnum('currency', ['UZS', 'USD']);
export const orderTypeEnum = pgEnum('order_type', ['retail', 'wholesale']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'transfer', 'debt']);
export const roleEnum = pgEnum('role', ['owner', 'admin', 'seller', 'developer']);
export const orderStatusEnum = pgEnum('order_status', ['draft', 'completed', 'cancelled', 'refunded']);

// ---------------------------
// 1. USERS (Xodimlar & Owner)
// ---------------------------
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),

  role: roleEnum('role').default('seller').notNull(),

  cardId: varchar('card_id', { length: 100 }).unique(),

  fixSalary: decimal('fix_salary', { precision: 15, scale: 2 }).default('0'),
  bonusPercent: decimal('bonus_percent', { precision: 5, scale: 2 }).default('0'),
  finePerHour: decimal('fine_per_hour', { precision: 15, scale: 2 }).default('0'),

  workStartTime: time('work_start_time').default('09:00:00'),

  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Indexes for performance
  roleIdx: index('users_role_idx').on(table.role),
  isActiveIdx: index('users_is_active_idx').on(table.isActive, table.isDeleted),
  usernameIdx: index('users_username_idx').on(table.username),
}));

// ---------------------------
// 2. ATTENDANCE (Davomat) - [TUZATILDI]
// ---------------------------
export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),

  date: date('date').notNull(), // 2025-11-30 formatida

  checkIn: timestamp('check_in'),
  checkOut: timestamp('check_out'),

  lateMinutes: integer('late_minutes').default(0),

  status: varchar('status', { length: 20 }).default('present'),
}, (t) => ({
  // 🚨 MUHIM: Bir kunda bitta xodimga faqat bitta zapis bo'lishi shart!
  unqUserDate: unique().on(t.userId, t.date),
}));

// ---------------------------
// 3. KATEGORIYA
// ---------------------------
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Indexes for performance
  nameIdx: index('categories_name_idx').on(table.name),
  isActiveIdx: index('categories_is_active_idx').on(table.isActive, table.isDeleted),
}));

// ---------------------------
// 4. HAMKORLAR
// ---------------------------
export const partners = pgTable('partners', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  balance: decimal('balance', { precision: 18, scale: 2 }).default('0'),
  currency: currencyEnum('currency').default('UZS'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ---------------------------
// 5. MAHSULOTLAR
// ---------------------------
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  barcode: varchar('barcode', { length: 100 }).unique(),
  categoryId: integer('category_id').references(() => categories.id),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 15, scale: 2 }),
  currency: currencyEnum('currency').default('UZS').notNull(),
  stock: decimal('stock', { precision: 10, scale: 2 }).default('0'),
  unit: varchar('unit', { length: 20 }).default('dona'),
  image: text('image'),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Indexes for performance optimization
  barcodeIdx: index('products_barcode_idx').on(table.barcode),
  categoryIdx: index('products_category_idx').on(table.categoryId),
  nameIdx: index('products_name_idx').on(table.name),
  isActiveIdx: index('products_is_active_idx').on(table.isActive, table.isDeleted),
  currencyIdx: index('products_currency_idx').on(table.currency),
}));

// ---------------------------
// 6. NARXLAR TARIXI
// ---------------------------
export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  oldPrice: decimal('old_price', { precision: 15, scale: 2 }).notNull(),
  newPrice: decimal('new_price', { precision: 15, scale: 2 }).notNull(),
  currency: currencyEnum('currency').notNull(),
  changedAt: timestamp('changed_at').defaultNow(),
  changedBy: varchar('changed_by', { length: 100 }),
});

// ---------------------------
// 7. CHEKLAR (Orders)
// ---------------------------
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),

  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 18, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 18, scale: 2 }).notNull(),

  currency: currencyEnum('currency').default('UZS').notNull(),
  exchangeRate: decimal('exchange_rate', { precision: 10, scale: 2 }).default('1'),

  isPrinted: boolean('is_printed').default(false).notNull(),

  type: orderTypeEnum('type').default('retail'),
  status: orderStatusEnum('status').default('draft'),
  paymentMethod: paymentMethodEnum('payment_method').default('cash'),

  customerName: varchar('customer_name', { length: 100 }),
  partnerId: integer('partner_id').references(() => partners.id),

  sellerId: integer('seller_id').references(() => users.id),
  cashierId: integer('cashier_id').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  // Indexes for performance - most queried fields
  statusIdx: index('orders_status_idx').on(table.status),
  sellerIdx: index('orders_seller_idx').on(table.sellerId),
  cashierIdx: index('orders_cashier_idx').on(table.cashierId),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  statusCreatedIdx: index('orders_status_created_idx').on(table.status, table.createdAt),
  typeIdx: index('orders_type_idx').on(table.type),
  paymentMethodIdx: index('orders_payment_method_idx').on(table.paymentMethod),
  isPrintedIdx: index('orders_is_printed_idx').on(table.isPrinted),
}));

// ---------------------------
// 8. CHEK ELEMENTLARI
// ---------------------------
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  originalCurrency: currencyEnum('original_currency'),
  totalPrice: decimal('total_price', { precision: 18, scale: 2 }).notNull(),
});

// --- RELATIONS ---
export const usersRelations = relations(users, ({ many }) => ({
  attendances: many(attendance),
  sales: many(orders, { relationName: 'sellerOrders' }),
  cashierOrders: many(orders, { relationName: 'cashierOrders' }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, { fields: [attendance.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  priceHistory: many(priceHistory),
  stockHistory: many(stockHistory),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  partner: one(partners, { fields: [orders.partnerId], references: [partners.id] }),
  items: many(orderItems),
  // Relation Names match with Users
  seller: one(users, { fields: [orders.sellerId], references: [users.id], relationName: 'sellerOrders' }),
  cashier: one(users, { fields: [orders.cashierId], references: [users.id], relationName: 'cashierOrders' }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// 10. STOCK HISTORY (Kirimlar tarixi)
// ---------------------------
export const stockHistory = pgTable('stock_history', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  oldStock: decimal('old_stock', { precision: 10, scale: 2 }),
  newStock: decimal('new_stock', { precision: 10, scale: 2 }),
  newPrice: decimal('new_price', { precision: 15, scale: 2 }),
  addedBy: integer('added_by').references(() => users.id),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  productIdx: index('stock_history_product_idx').on(table.productId),
  createdAtIdx: index('stock_history_created_at_idx').on(table.createdAt),
}));

// ---------------------------
// 11. ERROR LOGS (Frontend xatoliklari)
// ---------------------------
export const errorLogLevelEnum = pgEnum('error_log_level', ['error', 'warning', 'info']);

export const errorLogs = pgTable('error_logs', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  stack: text('stack'),
  url: text('url').notNull(),
  userAgent: text('user_agent').notNull(),
  level: errorLogLevelEnum('level').default('error').notNull(),
  context: text('context'), // JSON string
  ip: varchar('ip', { length: 45 }), // IPv6 uchun
  userId: integer('user_id').references(() => users.id), // Agar user login qilgan bo'lsa
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  levelIdx: index('error_logs_level_idx').on(table.level),
  createdAtIdx: index('error_logs_created_at_idx').on(table.createdAt),
  userIdIdx: index('error_logs_user_id_idx').on(table.userId),
}));

export type NewOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type ErrorLog = typeof errorLogs.$inferSelect;
export type NewErrorLog = typeof errorLogs.$inferInsert;
export type StockHistory = typeof stockHistory.$inferSelect;
export type NewStockHistory = typeof stockHistory.$inferInsert;