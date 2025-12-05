import { pgTable, serial, text, integer, decimal, timestamp, varchar, boolean, pgEnum, time, date, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMLAR ---
export const currencyEnum = pgEnum('currency', ['UZS', 'USD']);
export const orderTypeEnum = pgEnum('order_type', ['retail', 'wholesale']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'transfer', 'debt']);
export const roleEnum = pgEnum('role', ['owner', 'admin', 'cashier', 'seller', 'developer']);
export const errorLogLevelEnum = pgEnum('error_log_level', ['error', 'warning', 'info']);

// 🔥 STATUSLAR (Refund uchun kerak)
export const orderStatusEnum = pgEnum('order_status', [
  'draft',              // Qoralama (savdo jarayoni)
  'completed',          // Sotildi (pul olindi)
  'cancelled',          // Bekor qilindi (sotilmay turib)
  'fully_refunded',     // To'liq qaytarildi
  'partially_refunded'  // Qisman qaytarildi
]);

// ---------------------------
// 1. USERS
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
  roleIdx: index('users_role_idx').on(table.role),
  usernameIdx: index('users_username_idx').on(table.username),
}));

// ---------------------------
// 2. ATTENDANCE
// ---------------------------
export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  date: date('date').notNull(),
  checkIn: timestamp('check_in'),
  checkOut: timestamp('check_out'),
  lateMinutes: integer('late_minutes').default(0),
  status: varchar('status', { length: 20 }).default('present'),
}, (t) => ({
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
});

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
// 5. MAHSULOTLAR (Products)
// ---------------------------
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  barcode: varchar('barcode', { length: 100 }).unique(),
  categoryId: integer('category_id').references(() => categories.id),
  
  price: decimal('price', { precision: 15, scale: 2 }).notNull(), // Asosiy narx
  
  // 🔥 1-TURDAGI CHEGIRMA: MAHSULOTGA MUDDATLI FOIZ/NARX BELGILASH
  discountPrice: decimal('discount_price', { precision: 15, scale: 2 }), // Aksiya narxi
  discountStart: timestamp('discount_start'), // Qachondan
  discountEnd: timestamp('discount_end'),     // Qachongacha

  originalPrice: decimal('original_price', { precision: 15, scale: 2 }), // Kelish narxi (foyda hisoblash uchun)
  
  currency: currencyEnum('currency').default('UZS').notNull(),
  stock: decimal('stock', { precision: 10, scale: 2 }).default('0'),
  unit: varchar('unit', { length: 20 }).default('dona'),
  image: text('image'),
  
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  barcodeIdx: index('products_barcode_idx').on(table.barcode),
  nameIdx: index('products_name_idx').on(table.name),
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
// 7. STOCK HISTORY (Kirimlar)
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
});

// ---------------------------
// 8. CHEKLAR (Orders) - 🔥 3-TUR CHEGIRMA: UMUMIY SUMMAGA
// ---------------------------
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),

  // 🔥 SUMMALAR LOGIKASI:
  // totalAmount: Barcha itemlarning yig'indisi (10,000,000)
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).notNull(),
  
  // discountAmount: Umumiy summaga qilingan chegirma (masalan 5% -> 500,000)
  discountAmount: decimal('discount_amount', { precision: 18, scale: 2 }).default('0'),
  
  // finalAmount: To'lanadigan summa (9,500,000)
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
  statusIdx: index('orders_status_idx').on(table.status),
  sellerIdx: index('orders_seller_idx').on(table.sellerId),
}));

// ---------------------------
// 9. CHEK ELEMENTLARI - 🔥 2-TUR CHEGIRMA: BITTA ITEMGA
// ---------------------------
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  
  // 🔥 MANUAL DISCOUNT UCHUN:
  // originalPrice: Katalogdagi narxi (masalan 100,000)
  originalPrice: decimal('original_price', { precision: 15, scale: 2 }).default('0').notNull(),
  
  // price: Haqiqiy sotilgan narxi (masalan 90,000). 
  // Farqi = Chegirma
  price: decimal('price', { precision: 15, scale: 2 }).notNull(), 
  
  totalPrice: decimal('total_price', { precision: 18, scale: 2 }).notNull(), // quantity * price
});

// ---------------------------
// 10. 🔥 VOZVRAT (Refunds) - JAVOBGAR SHAXS BILAN
// ---------------------------
export const refunds = pgTable('refunds', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(), // Qaysi chek
  
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).notNull(), // Qaytarilgan summa
  
  reason: text('reason'), // Nega qaytarildi?
  
  // 🔥 KIM QAYTARDI? (Owner yoki Admin ID bo'ladi)
  refundedBy: integer('refunded_by').references(() => users.id).notNull(), 
  
  createdAt: timestamp('created_at').defaultNow(),
});

// ---------------------------
// 11. 🔥 VOZVRAT ITEMLAR
// ---------------------------
export const refundItems = pgTable('refund_items', {
  id: serial('id').primaryKey(),
  refundId: integer('refund_id').references(() => refunds.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(), // Qancha qaytdi
  price: decimal('price', { precision: 15, scale: 2 }).notNull(), // Qanchadan hisoblandi (Sotilgan narxidan)
});

// ---------------------------
// 12. ERROR LOGS
// ---------------------------
export const errorLogs = pgTable('error_logs', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  stack: text('stack'),
  url: text('url').notNull(),
  userAgent: text('user_agent').notNull(),
  level: errorLogLevelEnum('level').default('error').notNull(),
  context: text('context'),
  ip: varchar('ip', { length: 45 }),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  attendances: many(attendance),
  sales: many(orders, { relationName: 'sellerOrders' }),
  cashierOrders: many(orders, { relationName: 'cashierOrders' }),
  addedStocks: many(stockHistory),
  refundsProcessed: many(refunds), // User tasdiqlagan vozvratlar
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  priceHistory: many(priceHistory),
  stockHistory: many(stockHistory),
  orderItems: many(orderItems),
  refundItems: many(refundItems),
}));

export const stockHistoryRelations = relations(stockHistory, ({ one }) => ({
  product: one(products, { fields: [stockHistory.productId], references: [products.id] }),
  addedBy: one(users, { fields: [stockHistory.addedBy], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  partner: one(partners, { fields: [orders.partnerId], references: [partners.id] }),
  items: many(orderItems),
  seller: one(users, { fields: [orders.sellerId], references: [users.id], relationName: 'sellerOrders' }),
  cashier: one(users, { fields: [orders.cashierId], references: [users.id], relationName: 'cashierOrders' }),
  refunds: many(refunds), 
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const refundsRelations = relations(refunds, ({ one, many }) => ({
  order: one(orders, { fields: [refunds.orderId], references: [orders.id] }),
  items: many(refundItems),
  refundedBy: one(users, { fields: [refunds.refundedBy], references: [users.id] }), // Mas'ul shaxs
}));

export const refundItemsRelations = relations(refundItems, ({ one }) => ({
  refund: one(refunds, { fields: [refundItems.refundId], references: [refunds.id] }),
  product: one(products, { fields: [refundItems.productId], references: [products.id] }),
}));

// TYPES
export type NewOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type StockHistory = typeof stockHistory.$inferSelect;
export type Product = typeof products.$inferSelect;
export type User = typeof users.$inferSelect;