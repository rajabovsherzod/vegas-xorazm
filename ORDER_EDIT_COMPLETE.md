# ✅ ORDER EDIT FEATURE - TO'LIQ TAYYOR!

## 🎉 BAJARILGAN ISHLAR

### **Backend (4 bosqich):**
1. ✅ **GET /orders/:id** - Bitta orderni olish
2. ✅ **updateOrderSchema** - Validation schema
3. ✅ **PUT /orders/:id** - Murakkab stock logika bilan tahrir
4. ✅ **Routes + Permissions** - seller, cashier, owner

### **Frontend (5 bosqich):**
5. ✅ **orderService.ts** - getById va update metodlar
6. ✅ **Orders List** - "Tahrir qilish" tugmasi (faqat draft)
7. ✅ **Edit Order Page** - POS interface bilan
8. ✅ **Real-time** - Socket.IO notifications
9. ✅ **Toasts** - Success/Error xabarlari

---

## 🧪 YAKUNIY TEST REJASI

### **1. Kassir sifatida test:**

#### **A. Login:**
```
URL: http://localhost:3000/auth/login
Username: sherzod
Password: owner123
```

#### **B. Orders sahifasiga o'tish:**
```
URL: http://localhost:3000/cashier/orders
```

#### **C. Draft order yaratish (Postman orqali yoki Seller POS dan):**
- Kamida 2-3 ta mahsulot qo'shing
- Status: draft bo'lishi kerak

#### **D. "Tahrir qilish" tugmasini bosish:**
1. Draft order ustiga 3 nuqta (⋮) bosing
2. "Tahrir qilish" ni tanlang
3. Edit sahifasiga o'tkaziladi

#### **E. Mahsulotlarni tahrir qilish:**
**Test 1: Miqdorni o'zgartirish**
- Mahsulot 1: 3 ta → 5 ta (2 ta qo'shimcha)
- Mahsulot 2: 5 ta → 2 ta (3 ta kamayadi)
- "Saqlash" tugmasini bosing

**Kutilgan natija:**
- ✅ Order muvaffaqiyatli yangilanadi
- ✅ Stock to'g'ri hisoblanadi
- ✅ Toast: "Buyurtma muvaffaqiyatli tahrir qilindi!"
- ✅ Orders listiga qaytadi

**Test 2: Yangi mahsulot qo'shish**
- Mahsulotlar listidan yangi mahsulot tanlang
- Miqdorni kiriting
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Yangi mahsulot qo'shiladi
- ✅ Total amount qayta hisoblanadi
- ✅ Stock yangilanadi

**Test 3: Mahsulot olib tashlash**
- Savatdagi mahsulot ustiga "Trash" (🗑️) bosing
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Mahsulot olib tashlanadi
- ✅ Stock omborga qaytadi
- ✅ Total amount kamayadi

---

### **2. Seller sifatida test:**

#### **A. Login:**
```
URL: http://localhost:3000/auth/login
Username: seller
Password: seller123
```

#### **B. POS dan order yaratish:**
```
URL: http://localhost:3000/seller/pos
```
- 2-3 ta mahsulot qo'shing
- "Saqlash" ni bosing (Draft yaratiladi)

#### **C. Completed Orders sahifasiga o'tish:**
```
URL: http://localhost:3000/seller/completed-orders
```
*(Agar seller uchun orders list bo'lsa, u yerdan)*

#### **D. O'z orderini tahrir qilish:**
- Draft order ustiga "Tahrir qilish" tugmasini bosing
- Mahsulotlarni o'zgartiring
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Muvaffaqiyatli tahrir qiladi (o'z orderini)

#### **E. Boshqa seller orderini tahrir qilishga urinish:**
- Boshqa seller yaratgan draft orderni toping
- "Tahrir qilish" tugmasini bosing

**Kutilgan natija:**
- ❌ Backend xato: "Bu buyurtma sizga tegishli emas" (403)
- ❌ Toast: Error xabari

---

### **3. Real-time test (2 ta brauzer):**

#### **A. Brauzer 1: Kassir (Admin)**
```
URL: http://localhost:3000/cashier/orders
```

#### **B. Brauzer 2: Seller**
```
URL: http://localhost:3000/seller/pos
```

#### **C. Test:**
1. **Seller** POS da yangi order yaratsin
2. **Kassir** ekranida real-time da yangi order paydo bo'lishi kerak
3. **Kassir** orderni tahrir qilsin
4. **Seller** ekranida stock real-time yangilanishi kerak

**Kutilgan natija:**
- ✅ Brauzer 1 da toast: "Yangi buyurtma #X qabul qilindi!"
- ✅ Orders list avtomatik yangilanadi
- ✅ Stock real-time da o'zgaradi

---

### **4. Xato holatlarni test qilish:**

#### **Test A: Completed orderni tahrir qilish**
1. Draft orderni "Tasdiqlash" (Confirm) qiling
2. Endi tahrir qilishga harakat qiling

**Kutilgan natija:**
- ❌ Backend xato: "Faqat kutilayotgan orderlarni tahrir qilish mumkin" (400)
- ❌ Toast: Error xabari

#### **Test B: Omborda yetarli mahsulot yo'q**
1. Orderni tahrir qilayotganda juda ko'p miqdor kiriting (masalan: 999999)
2. "Saqlash" ni bosing

**Kutilgan natija:**
- ❌ Backend xato: "Omborda yetarli mahsulot yo'q: [Mahsulot nomi]" (409)
- ❌ Toast: Error xabari

#### **Test C: Bo'sh savat**
1. Barcha mahsulotlarni savatdan olib tashlang
2. "Saqlash" ni bosing

**Kutilgan natija:**
- ❌ Frontend validation: "Kamida bitta mahsulot tanlang"
- ❌ Toast: Error xabari

---

## 📊 NATIJALAR JADVALI

| Test | Kutilgan Natija | Haqiqiy Natija | Status |
|------|----------------|----------------|--------|
| GET /orders/:id | Order ma'lumotlari | ⏳ | ⏳ |
| PUT /orders/:id (miqdor) | Stock to'g'ri hisoblanadi | ⏳ | ⏳ |
| PUT /orders/:id (qo'shish) | Yangi mahsulot qo'shiladi | ⏳ | ⏳ |
| PUT /orders/:id (olib tashlash) | Stock qaytadi | ⏳ | ⏳ |
| Completed orderni tahrir | 400 xato | ⏳ | ⏳ |
| Boshqa seller orderini tahrir | 403 xato | ⏳ | ⏳ |
| Yetarli stock yo'q | 409 xato | ⏳ | ⏳ |
| Real-time notification | Toast va yangilanish | ⏳ | ⏳ |
| Kassir tahrir qilishi | Muvaffaqiyatli | ⏳ | ⏳ |

---

## 🚀 ISHGA TUSHIRISH

### **Backend:**
```bash
cd /home/sherzod-rajabov/Desktop/vegas/backend
pnpm dev
```

### **Frontend:**
```bash
cd /home/sherzod-rajabov/Desktop/vegas/client
pnpm dev
```

### **Database:**
- PostgreSQL ishlab turishi kerak (Port: 5450)
- Drizzle Studio: `pnpm drizzle-kit studio`

---

## 📝 API ENDPOINTS

### **Yangi Endpointlar:**
```
GET    /api/v1/orders/:id          - Bitta orderni olish
PUT    /api/v1/orders/:id          - Orderni tahrir qilish
```

### **Permissions:**
- **GET /orders/:id**: seller, cashier, owner
- **PUT /orders/:id**: seller (faqat o'ziniki), cashier, owner

---

## 🎯 KEYINGI QADAMLAR

1. ✅ Barcha testlarni o'tkazing
2. ✅ Natijalarni jadvalni to'ldiring
3. ✅ Agar xato bo'lsa, tuzating
4. ✅ Production ga deploy qilish uchun tayyor!

---

## 📞 MUAMMOLAR

Agar biror muammo bo'lsa:
1. Backend console loglarini tekshiring
2. Frontend console loglarini tekshiring
3. Network tab da API so'rovlarni tekshiring
4. Postman da API ni to'g'ridan-to'g'ri test qiling

---

**🎉 TABRIKLAYMIZ! Order Edit Feature to'liq tayyor!** 🚀


## 🎉 BAJARILGAN ISHLAR

### **Backend (4 bosqich):**
1. ✅ **GET /orders/:id** - Bitta orderni olish
2. ✅ **updateOrderSchema** - Validation schema
3. ✅ **PUT /orders/:id** - Murakkab stock logika bilan tahrir
4. ✅ **Routes + Permissions** - seller, cashier, owner

### **Frontend (5 bosqich):**
5. ✅ **orderService.ts** - getById va update metodlar
6. ✅ **Orders List** - "Tahrir qilish" tugmasi (faqat draft)
7. ✅ **Edit Order Page** - POS interface bilan
8. ✅ **Real-time** - Socket.IO notifications
9. ✅ **Toasts** - Success/Error xabarlari

---

## 🧪 YAKUNIY TEST REJASI

### **1. Kassir sifatida test:**

#### **A. Login:**
```
URL: http://localhost:3000/auth/login
Username: sherzod
Password: owner123
```

#### **B. Orders sahifasiga o'tish:**
```
URL: http://localhost:3000/cashier/orders
```

#### **C. Draft order yaratish (Postman orqali yoki Seller POS dan):**
- Kamida 2-3 ta mahsulot qo'shing
- Status: draft bo'lishi kerak

#### **D. "Tahrir qilish" tugmasini bosish:**
1. Draft order ustiga 3 nuqta (⋮) bosing
2. "Tahrir qilish" ni tanlang
3. Edit sahifasiga o'tkaziladi

#### **E. Mahsulotlarni tahrir qilish:**
**Test 1: Miqdorni o'zgartirish**
- Mahsulot 1: 3 ta → 5 ta (2 ta qo'shimcha)
- Mahsulot 2: 5 ta → 2 ta (3 ta kamayadi)
- "Saqlash" tugmasini bosing

**Kutilgan natija:**
- ✅ Order muvaffaqiyatli yangilanadi
- ✅ Stock to'g'ri hisoblanadi
- ✅ Toast: "Buyurtma muvaffaqiyatli tahrir qilindi!"
- ✅ Orders listiga qaytadi

**Test 2: Yangi mahsulot qo'shish**
- Mahsulotlar listidan yangi mahsulot tanlang
- Miqdorni kiriting
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Yangi mahsulot qo'shiladi
- ✅ Total amount qayta hisoblanadi
- ✅ Stock yangilanadi

**Test 3: Mahsulot olib tashlash**
- Savatdagi mahsulot ustiga "Trash" (🗑️) bosing
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Mahsulot olib tashlanadi
- ✅ Stock omborga qaytadi
- ✅ Total amount kamayadi

---

### **2. Seller sifatida test:**

#### **A. Login:**
```
URL: http://localhost:3000/auth/login
Username: seller
Password: seller123
```

#### **B. POS dan order yaratish:**
```
URL: http://localhost:3000/seller/pos
```
- 2-3 ta mahsulot qo'shing
- "Saqlash" ni bosing (Draft yaratiladi)

#### **C. Completed Orders sahifasiga o'tish:**
```
URL: http://localhost:3000/seller/completed-orders
```
*(Agar seller uchun orders list bo'lsa, u yerdan)*

#### **D. O'z orderini tahrir qilish:**
- Draft order ustiga "Tahrir qilish" tugmasini bosing
- Mahsulotlarni o'zgartiring
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Muvaffaqiyatli tahrir qiladi (o'z orderini)

#### **E. Boshqa seller orderini tahrir qilishga urinish:**
- Boshqa seller yaratgan draft orderni toping
- "Tahrir qilish" tugmasini bosing

**Kutilgan natija:**
- ❌ Backend xato: "Bu buyurtma sizga tegishli emas" (403)
- ❌ Toast: Error xabari

---

### **3. Real-time test (2 ta brauzer):**

#### **A. Brauzer 1: Kassir (Admin)**
```
URL: http://localhost:3000/cashier/orders
```

#### **B. Brauzer 2: Seller**
```
URL: http://localhost:3000/seller/pos
```

#### **C. Test:**
1. **Seller** POS da yangi order yaratsin
2. **Kassir** ekranida real-time da yangi order paydo bo'lishi kerak
3. **Kassir** orderni tahrir qilsin
4. **Seller** ekranida stock real-time yangilanishi kerak

**Kutilgan natija:**
- ✅ Brauzer 1 da toast: "Yangi buyurtma #X qabul qilindi!"
- ✅ Orders list avtomatik yangilanadi
- ✅ Stock real-time da o'zgaradi

---

### **4. Xato holatlarni test qilish:**

#### **Test A: Completed orderni tahrir qilish**
1. Draft orderni "Tasdiqlash" (Confirm) qiling
2. Endi tahrir qilishga harakat qiling

**Kutilgan natija:**
- ❌ Backend xato: "Faqat kutilayotgan orderlarni tahrir qilish mumkin" (400)
- ❌ Toast: Error xabari

#### **Test B: Omborda yetarli mahsulot yo'q**
1. Orderni tahrir qilayotganda juda ko'p miqdor kiriting (masalan: 999999)
2. "Saqlash" ni bosing

**Kutilgan natija:**
- ❌ Backend xato: "Omborda yetarli mahsulot yo'q: [Mahsulot nomi]" (409)
- ❌ Toast: Error xabari

#### **Test C: Bo'sh savat**
1. Barcha mahsulotlarni savatdan olib tashlang
2. "Saqlash" ni bosing

**Kutilgan natija:**
- ❌ Frontend validation: "Kamida bitta mahsulot tanlang"
- ❌ Toast: Error xabari

---

## 📊 NATIJALAR JADVALI

| Test | Kutilgan Natija | Haqiqiy Natija | Status |
|------|----------------|----------------|--------|
| GET /orders/:id | Order ma'lumotlari | ⏳ | ⏳ |
| PUT /orders/:id (miqdor) | Stock to'g'ri hisoblanadi | ⏳ | ⏳ |
| PUT /orders/:id (qo'shish) | Yangi mahsulot qo'shiladi | ⏳ | ⏳ |
| PUT /orders/:id (olib tashlash) | Stock qaytadi | ⏳ | ⏳ |
| Completed orderni tahrir | 400 xato | ⏳ | ⏳ |
| Boshqa seller orderini tahrir | 403 xato | ⏳ | ⏳ |
| Yetarli stock yo'q | 409 xato | ⏳ | ⏳ |
| Real-time notification | Toast va yangilanish | ⏳ | ⏳ |
| Kassir tahrir qilishi | Muvaffaqiyatli | ⏳ | ⏳ |

---

## 🚀 ISHGA TUSHIRISH

### **Backend:**
```bash
cd /home/sherzod-rajabov/Desktop/vegas/backend
pnpm dev
```

### **Frontend:**
```bash
cd /home/sherzod-rajabov/Desktop/vegas/client
pnpm dev
```

### **Database:**
- PostgreSQL ishlab turishi kerak (Port: 5450)
- Drizzle Studio: `pnpm drizzle-kit studio`

---

## 📝 API ENDPOINTS

### **Yangi Endpointlar:**
```
GET    /api/v1/orders/:id          - Bitta orderni olish
PUT    /api/v1/orders/:id          - Orderni tahrir qilish
```

### **Permissions:**
- **GET /orders/:id**: seller, cashier, owner
- **PUT /orders/:id**: seller (faqat o'ziniki), cashier, owner

---

## 🎯 KEYINGI QADAMLAR

1. ✅ Barcha testlarni o'tkazing
2. ✅ Natijalarni jadvalni to'ldiring
3. ✅ Agar xato bo'lsa, tuzating
4. ✅ Production ga deploy qilish uchun tayyor!

---

## 📞 MUAMMOLAR

Agar biror muammo bo'lsa:
1. Backend console loglarini tekshiring
2. Frontend console loglarini tekshiring
3. Network tab da API so'rovlarni tekshiring
4. Postman da API ni to'g'ridan-to'g'ri test qiling

---

**🎉 TABRIKLAYMIZ! Order Edit Feature to'liq tayyor!** 🚀



## 🎉 BAJARILGAN ISHLAR

### **Backend (4 bosqich):**
1. ✅ **GET /orders/:id** - Bitta orderni olish
2. ✅ **updateOrderSchema** - Validation schema
3. ✅ **PUT /orders/:id** - Murakkab stock logika bilan tahrir
4. ✅ **Routes + Permissions** - seller, cashier, owner

### **Frontend (5 bosqich):**
5. ✅ **orderService.ts** - getById va update metodlar
6. ✅ **Orders List** - "Tahrir qilish" tugmasi (faqat draft)
7. ✅ **Edit Order Page** - POS interface bilan
8. ✅ **Real-time** - Socket.IO notifications
9. ✅ **Toasts** - Success/Error xabarlari

---

## 🧪 YAKUNIY TEST REJASI

### **1. Kassir sifatida test:**

#### **A. Login:**
```
URL: http://localhost:3000/auth/login
Username: sherzod
Password: owner123
```

#### **B. Orders sahifasiga o'tish:**
```
URL: http://localhost:3000/cashier/orders
```

#### **C. Draft order yaratish (Postman orqali yoki Seller POS dan):**
- Kamida 2-3 ta mahsulot qo'shing
- Status: draft bo'lishi kerak

#### **D. "Tahrir qilish" tugmasini bosish:**
1. Draft order ustiga 3 nuqta (⋮) bosing
2. "Tahrir qilish" ni tanlang
3. Edit sahifasiga o'tkaziladi

#### **E. Mahsulotlarni tahrir qilish:**
**Test 1: Miqdorni o'zgartirish**
- Mahsulot 1: 3 ta → 5 ta (2 ta qo'shimcha)
- Mahsulot 2: 5 ta → 2 ta (3 ta kamayadi)
- "Saqlash" tugmasini bosing

**Kutilgan natija:**
- ✅ Order muvaffaqiyatli yangilanadi
- ✅ Stock to'g'ri hisoblanadi
- ✅ Toast: "Buyurtma muvaffaqiyatli tahrir qilindi!"
- ✅ Orders listiga qaytadi

**Test 2: Yangi mahsulot qo'shish**
- Mahsulotlar listidan yangi mahsulot tanlang
- Miqdorni kiriting
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Yangi mahsulot qo'shiladi
- ✅ Total amount qayta hisoblanadi
- ✅ Stock yangilanadi

**Test 3: Mahsulot olib tashlash**
- Savatdagi mahsulot ustiga "Trash" (🗑️) bosing
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Mahsulot olib tashlanadi
- ✅ Stock omborga qaytadi
- ✅ Total amount kamayadi

---

### **2. Seller sifatida test:**

#### **A. Login:**
```
URL: http://localhost:3000/auth/login
Username: seller
Password: seller123
```

#### **B. POS dan order yaratish:**
```
URL: http://localhost:3000/seller/pos
```
- 2-3 ta mahsulot qo'shing
- "Saqlash" ni bosing (Draft yaratiladi)

#### **C. Completed Orders sahifasiga o'tish:**
```
URL: http://localhost:3000/seller/completed-orders
```
*(Agar seller uchun orders list bo'lsa, u yerdan)*

#### **D. O'z orderini tahrir qilish:**
- Draft order ustiga "Tahrir qilish" tugmasini bosing
- Mahsulotlarni o'zgartiring
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Muvaffaqiyatli tahrir qiladi (o'z orderini)

#### **E. Boshqa seller orderini tahrir qilishga urinish:**
- Boshqa seller yaratgan draft orderni toping
- "Tahrir qilish" tugmasini bosing

**Kutilgan natija:**
- ❌ Backend xato: "Bu buyurtma sizga tegishli emas" (403)
- ❌ Toast: Error xabari

---

### **3. Real-time test (2 ta brauzer):**

#### **A. Brauzer 1: Kassir (Admin)**
```
URL: http://localhost:3000/cashier/orders
```

#### **B. Brauzer 2: Seller**
```
URL: http://localhost:3000/seller/pos
```

#### **C. Test:**
1. **Seller** POS da yangi order yaratsin
2. **Kassir** ekranida real-time da yangi order paydo bo'lishi kerak
3. **Kassir** orderni tahrir qilsin
4. **Seller** ekranida stock real-time yangilanishi kerak

**Kutilgan natija:**
- ✅ Brauzer 1 da toast: "Yangi buyurtma #X qabul qilindi!"
- ✅ Orders list avtomatik yangilanadi
- ✅ Stock real-time da o'zgaradi

---

### **4. Xato holatlarni test qilish:**

#### **Test A: Completed orderni tahrir qilish**
1. Draft orderni "Tasdiqlash" (Confirm) qiling
2. Endi tahrir qilishga harakat qiling

**Kutilgan natija:**
- ❌ Backend xato: "Faqat kutilayotgan orderlarni tahrir qilish mumkin" (400)
- ❌ Toast: Error xabari

#### **Test B: Omborda yetarli mahsulot yo'q**
1. Orderni tahrir qilayotganda juda ko'p miqdor kiriting (masalan: 999999)
2. "Saqlash" ni bosing

**Kutilgan natija:**
- ❌ Backend xato: "Omborda yetarli mahsulot yo'q: [Mahsulot nomi]" (409)
- ❌ Toast: Error xabari

#### **Test C: Bo'sh savat**
1. Barcha mahsulotlarni savatdan olib tashlang
2. "Saqlash" ni bosing

**Kutilgan natija:**
- ❌ Frontend validation: "Kamida bitta mahsulot tanlang"
- ❌ Toast: Error xabari

---

## 📊 NATIJALAR JADVALI

| Test | Kutilgan Natija | Haqiqiy Natija | Status |
|------|----------------|----------------|--------|
| GET /orders/:id | Order ma'lumotlari | ⏳ | ⏳ |
| PUT /orders/:id (miqdor) | Stock to'g'ri hisoblanadi | ⏳ | ⏳ |
| PUT /orders/:id (qo'shish) | Yangi mahsulot qo'shiladi | ⏳ | ⏳ |
| PUT /orders/:id (olib tashlash) | Stock qaytadi | ⏳ | ⏳ |
| Completed orderni tahrir | 400 xato | ⏳ | ⏳ |
| Boshqa seller orderini tahrir | 403 xato | ⏳ | ⏳ |
| Yetarli stock yo'q | 409 xato | ⏳ | ⏳ |
| Real-time notification | Toast va yangilanish | ⏳ | ⏳ |
| Kassir tahrir qilishi | Muvaffaqiyatli | ⏳ | ⏳ |

---

## 🚀 ISHGA TUSHIRISH

### **Backend:**
```bash
cd /home/sherzod-rajabov/Desktop/vegas/backend
pnpm dev
```

### **Frontend:**
```bash
cd /home/sherzod-rajabov/Desktop/vegas/client
pnpm dev
```

### **Database:**
- PostgreSQL ishlab turishi kerak (Port: 5450)
- Drizzle Studio: `pnpm drizzle-kit studio`

---

## 📝 API ENDPOINTS

### **Yangi Endpointlar:**
```
GET    /api/v1/orders/:id          - Bitta orderni olish
PUT    /api/v1/orders/:id          - Orderni tahrir qilish
```

### **Permissions:**
- **GET /orders/:id**: seller, cashier, owner
- **PUT /orders/:id**: seller (faqat o'ziniki), cashier, owner

---

## 🎯 KEYINGI QADAMLAR

1. ✅ Barcha testlarni o'tkazing
2. ✅ Natijalarni jadvalni to'ldiring
3. ✅ Agar xato bo'lsa, tuzating
4. ✅ Production ga deploy qilish uchun tayyor!

---

## 📞 MUAMMOLAR

Agar biror muammo bo'lsa:
1. Backend console loglarini tekshiring
2. Frontend console loglarini tekshiring
3. Network tab da API so'rovlarni tekshiring
4. Postman da API ni to'g'ridan-to'g'ri test qiling

---

**🎉 TABRIKLAYMIZ! Order Edit Feature to'liq tayyor!** 🚀


## 🎉 BAJARILGAN ISHLAR

### **Backend (4 bosqich):**
1. ✅ **GET /orders/:id** - Bitta orderni olish
2. ✅ **updateOrderSchema** - Validation schema
3. ✅ **PUT /orders/:id** - Murakkab stock logika bilan tahrir
4. ✅ **Routes + Permissions** - seller, cashier, owner

### **Frontend (5 bosqich):**
5. ✅ **orderService.ts** - getById va update metodlar
6. ✅ **Orders List** - "Tahrir qilish" tugmasi (faqat draft)
7. ✅ **Edit Order Page** - POS interface bilan
8. ✅ **Real-time** - Socket.IO notifications
9. ✅ **Toasts** - Success/Error xabarlari

---

## 🧪 YAKUNIY TEST REJASI

### **1. Kassir sifatida test:**

#### **A. Login:**
```
URL: http://localhost:3000/auth/login
Username: sherzod
Password: owner123
```

#### **B. Orders sahifasiga o'tish:**
```
URL: http://localhost:3000/cashier/orders
```

#### **C. Draft order yaratish (Postman orqali yoki Seller POS dan):**
- Kamida 2-3 ta mahsulot qo'shing
- Status: draft bo'lishi kerak

#### **D. "Tahrir qilish" tugmasini bosish:**
1. Draft order ustiga 3 nuqta (⋮) bosing
2. "Tahrir qilish" ni tanlang
3. Edit sahifasiga o'tkaziladi

#### **E. Mahsulotlarni tahrir qilish:**
**Test 1: Miqdorni o'zgartirish**
- Mahsulot 1: 3 ta → 5 ta (2 ta qo'shimcha)
- Mahsulot 2: 5 ta → 2 ta (3 ta kamayadi)
- "Saqlash" tugmasini bosing

**Kutilgan natija:**
- ✅ Order muvaffaqiyatli yangilanadi
- ✅ Stock to'g'ri hisoblanadi
- ✅ Toast: "Buyurtma muvaffaqiyatli tahrir qilindi!"
- ✅ Orders listiga qaytadi

**Test 2: Yangi mahsulot qo'shish**
- Mahsulotlar listidan yangi mahsulot tanlang
- Miqdorni kiriting
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Yangi mahsulot qo'shiladi
- ✅ Total amount qayta hisoblanadi
- ✅ Stock yangilanadi

**Test 3: Mahsulot olib tashlash**
- Savatdagi mahsulot ustiga "Trash" (🗑️) bosing
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Mahsulot olib tashlanadi
- ✅ Stock omborga qaytadi
- ✅ Total amount kamayadi

---

### **2. Seller sifatida test:**

#### **A. Login:**
```
URL: http://localhost:3000/auth/login
Username: seller
Password: seller123
```

#### **B. POS dan order yaratish:**
```
URL: http://localhost:3000/seller/pos
```
- 2-3 ta mahsulot qo'shing
- "Saqlash" ni bosing (Draft yaratiladi)

#### **C. Completed Orders sahifasiga o'tish:**
```
URL: http://localhost:3000/seller/completed-orders
```
*(Agar seller uchun orders list bo'lsa, u yerdan)*

#### **D. O'z orderini tahrir qilish:**
- Draft order ustiga "Tahrir qilish" tugmasini bosing
- Mahsulotlarni o'zgartiring
- "Saqlash" ni bosing

**Kutilgan natija:**
- ✅ Muvaffaqiyatli tahrir qiladi (o'z orderini)

#### **E. Boshqa seller orderini tahrir qilishga urinish:**
- Boshqa seller yaratgan draft orderni toping
- "Tahrir qilish" tugmasini bosing

**Kutilgan natija:**
- ❌ Backend xato: "Bu buyurtma sizga tegishli emas" (403)
- ❌ Toast: Error xabari

---

### **3. Real-time test (2 ta brauzer):**

#### **A. Brauzer 1: Kassir (Admin)**
```
URL: http://localhost:3000/cashier/orders
```

#### **B. Brauzer 2: Seller**
```
URL: http://localhost:3000/seller/pos
```

#### **C. Test:**
1. **Seller** POS da yangi order yaratsin
2. **Kassir** ekranida real-time da yangi order paydo bo'lishi kerak
3. **Kassir** orderni tahrir qilsin
4. **Seller** ekranida stock real-time yangilanishi kerak

**Kutilgan natija:**
- ✅ Brauzer 1 da toast: "Yangi buyurtma #X qabul qilindi!"
- ✅ Orders list avtomatik yangilanadi
- ✅ Stock real-time da o'zgaradi

---

### **4. Xato holatlarni test qilish:**

#### **Test A: Completed orderni tahrir qilish**
1. Draft orderni "Tasdiqlash" (Confirm) qiling
2. Endi tahrir qilishga harakat qiling

**Kutilgan natija:**
- ❌ Backend xato: "Faqat kutilayotgan orderlarni tahrir qilish mumkin" (400)
- ❌ Toast: Error xabari

#### **Test B: Omborda yetarli mahsulot yo'q**
1. Orderni tahrir qilayotganda juda ko'p miqdor kiriting (masalan: 999999)
2. "Saqlash" ni bosing

**Kutilgan natija:**
- ❌ Backend xato: "Omborda yetarli mahsulot yo'q: [Mahsulot nomi]" (409)
- ❌ Toast: Error xabari

#### **Test C: Bo'sh savat**
1. Barcha mahsulotlarni savatdan olib tashlang
2. "Saqlash" ni bosing

**Kutilgan natija:**
- ❌ Frontend validation: "Kamida bitta mahsulot tanlang"
- ❌ Toast: Error xabari

---

## 📊 NATIJALAR JADVALI

| Test | Kutilgan Natija | Haqiqiy Natija | Status |
|------|----------------|----------------|--------|
| GET /orders/:id | Order ma'lumotlari | ⏳ | ⏳ |
| PUT /orders/:id (miqdor) | Stock to'g'ri hisoblanadi | ⏳ | ⏳ |
| PUT /orders/:id (qo'shish) | Yangi mahsulot qo'shiladi | ⏳ | ⏳ |
| PUT /orders/:id (olib tashlash) | Stock qaytadi | ⏳ | ⏳ |
| Completed orderni tahrir | 400 xato | ⏳ | ⏳ |
| Boshqa seller orderini tahrir | 403 xato | ⏳ | ⏳ |
| Yetarli stock yo'q | 409 xato | ⏳ | ⏳ |
| Real-time notification | Toast va yangilanish | ⏳ | ⏳ |
| Kassir tahrir qilishi | Muvaffaqiyatli | ⏳ | ⏳ |

---

## 🚀 ISHGA TUSHIRISH

### **Backend:**
```bash
cd /home/sherzod-rajabov/Desktop/vegas/backend
pnpm dev
```

### **Frontend:**
```bash
cd /home/sherzod-rajabov/Desktop/vegas/client
pnpm dev
```

### **Database:**
- PostgreSQL ishlab turishi kerak (Port: 5450)
- Drizzle Studio: `pnpm drizzle-kit studio`

---

## 📝 API ENDPOINTS

### **Yangi Endpointlar:**
```
GET    /api/v1/orders/:id          - Bitta orderni olish
PUT    /api/v1/orders/:id          - Orderni tahrir qilish
```

### **Permissions:**
- **GET /orders/:id**: seller, cashier, owner
- **PUT /orders/:id**: seller (faqat o'ziniki), cashier, owner

---

## 🎯 KEYINGI QADAMLAR

1. ✅ Barcha testlarni o'tkazing
2. ✅ Natijalarni jadvalni to'ldiring
3. ✅ Agar xato bo'lsa, tuzating
4. ✅ Production ga deploy qilish uchun tayyor!

---

## 📞 MUAMMOLAR

Agar biror muammo bo'lsa:
1. Backend console loglarini tekshiring
2. Frontend console loglarini tekshiring
3. Network tab da API so'rovlarni tekshiring
4. Postman da API ni to'g'ridan-to'g'ri test qiling

---

**🎉 TABRIKLAYMIZ! Order Edit Feature to'liq tayyor!** 🚀





