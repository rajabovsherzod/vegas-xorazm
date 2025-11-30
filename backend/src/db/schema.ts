import { pgTable, serial, text, integer, decimal, timestamp, varchar, boolean, pgEnum, time, date, unique } from 'drizzle-orm/pg-core'; // unique import qilindi
import { relations } from 'drizzle-orm';

// --- ENUMLAR ---
export const currencyEnum = pgEnum('currency', ['UZS', 'USD']);
export const orderTypeEnum = pgEnum('order_type', ['retail', 'wholesale']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'transfer', 'debt']);
export const roleEnum = pgEnum('role', ['owner', 'admin', 'seller']);
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
});

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
});

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

  type: orderTypeEnum('type').default('retail'),
  status: orderStatusEnum('status').default('draft'), 
  paymentMethod: paymentMethodEnum('payment_method').default('cash'),
  
  customerName: varchar('customer_name', { length: 100 }),
  partnerId: integer('partner_id').references(() => partners.id),

  sellerId: integer('seller_id').references(() => users.id),
  cashierId: integer('cashier_id').references(() => users.id),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

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


export type NewOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;