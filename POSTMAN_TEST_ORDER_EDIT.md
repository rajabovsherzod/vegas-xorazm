# 🧪 POSTMAN TEST - Order Edit Feature

## 📋 Test Rejasi

### **Boshlash uchun:**
1. Backend ishga tushgan bo'lishi kerak (Port: 5000)
2. Login qilib, **Bearer Token** olish kerak
3. Kamida 1 ta **draft** order bo'lishi kerak

---

## 🔐 1. LOGIN (Token olish)

### **Seller sifatida login:**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "seller",
  "password": "seller123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "role": "seller",
      "username": "seller"
    }
  }
}
```

**Token ni copy qiling!** 👆

---

### **Kassir sifatida login:**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "sherzod",
  "password": "owner123"
}
```

*(Owner ham cashier rolida ishlaydi)*

---

## 📦 2. DRAFT ORDER YARATISH (Test uchun)

```http
POST http://localhost:5000/api/v1/orders
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "3" },
    { "productId": 4, "quantity": "5" }
  ],
  "customerName": "Test Mijoz",
  "type": "retail",
  "paymentMethod": "cash",
  "exchangeRate": "12800"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "status": "draft",
    "totalAmount": "15000000",
    ...
  },
  "message": "Buyurtma qabul qilindi (Draft)"
}
```

**Order ID ni yozib oling!** (Masalan: `19`)

---

## 🔍 3. BITTA ORDERNI OLISH (GET /orders/:id)

```http
GET http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "status": "draft",
    "customerName": "Test Mijoz",
    "totalAmount": "15000000",
    "items": [
      {
        "id": 45,
        "productId": 2,
        "quantity": "3",
        "price": "2000000",
        "product": {
          "id": 2,
          "name": "iPhone 15 Pro 256GB",
          "stock": "17"
        }
      },
      {
        "id": 46,
        "productId": 4,
        "quantity": "5",
        "price": "1800000",
        "product": {
          "id": 4,
          "name": "Diyor olma",
          "stock": "74"
        }
      }
    ]
  }
}
```

---

## ✏️ 4. ORDERNI TAHRIR QILISH (PUT /orders/:id)

### **Test 1: Mahsulot miqdorini o'zgartirish**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" },
    { "productId": 4, "quantity": "3" }
  ],
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 2: 3 → 5 (2 ta qo'shimcha ombordan ayriladi)
- ✅ Product 4: 5 → 3 (2 ta omborga qaytadi)
- ✅ Total amount qayta hisoblanadi
- ✅ Socket notification yuboriladi

---

### **Test 2: Yangi mahsulot qo'shish**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" },
    { "productId": 4, "quantity": "3" },
    { "productId": 7, "quantity": "10" }
  ],
  "customerName": "Test Mijoz (Updated)",
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 7 qo'shiladi (10 ta ombordan ayriladi)
- ✅ customerName yangilanadi
- ✅ Total amount qayta hisoblanadi

---

### **Test 3: Mahsulot olib tashlash**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" }
  ],
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 4 va 7 olib tashlandi
- ✅ Ularning stocki omborga qaytadi
- ✅ Faqat Product 2 qoladi

---

## ❌ 5. XATO HOLATLARNI TEST QILISH

### **Test 4: Completed orderni tahrir qilishga urinish**

1. Avval orderni Confirm qiling:
```http
PATCH http://localhost:5000/api/v1/orders/19/status
Authorization: Bearer <CASHIER_TOKEN>
Content-Type: application/json

{
  "status": "completed"
}
```

2. Keyin tahrir qilishga harakat qiling:
```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "10" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Faqat kutilayotgan orderlarni tahrir qilish mumkin",
  "statusCode": 400
}
```

---

### **Test 5: Boshqa seller orderni tahrir qilish**

1. **Seller1** order yaratsin (ID: 20)
2. **Seller2** token bilan tahrir qilishga harakat qilsin:

```http
PUT http://localhost:5000/api/v1/orders/20
Authorization: Bearer <SELLER2_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "10" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Bu buyurtma sizga tegishli emas",
  "statusCode": 403
}
```

---

### **Test 6: Omborda yetarli mahsulot yo'q**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "999999" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Omborda yetarli mahsulot yo'q: iPhone 15 Pro 256GB (Mavjud: 17, Kerak: 999999)",
  "statusCode": 409
}
```

---

### **Test 7: Kassir boshqa seller orderini tahrir qilishi**

```http
PUT http://localhost:5000/api/v1/orders/20
Authorization: Bearer <CASHIER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "2" }
  ]
}
```

**Kutilgan natija:**
- ✅ Kassir hamma draft orderlarni tahrir qilishi mumkin
- ✅ Order muvaffaqiyatli yangilanadi

---

## ✅ 6. YAKUNIY TEKSHIRISH

### **Ombor to'g'ri hisoblanganini tekshirish:**

1. Mahsulotlar listini oling:
```http
GET http://localhost:5000/api/v1/products
Authorization: Bearer <TOKEN>
```

2. Stock qiymatlarini tekshiring:
   - Har bir tahrir qilish operatsiyasidan keyin stock to'g'ri o'zgarganini tasdiqlang

---

## 📊 TEST NATIJALARI

| Test | Status | Izoh |
|------|--------|------|
| GET /orders/:id | ⏳ | Bitta orderni olish |
| PUT /orders/:id (miqdor o'zgartirish) | ⏳ | Stock to'g'ri hisoblanadi |
| PUT /orders/:id (mahsulot qo'shish) | ⏳ | Yangi mahsulot qo'shiladi |
| PUT /orders/:id (mahsulot olib tashlash) | ⏳ | Stock qaytadi |
| Completed orderni tahrir qilish | ⏳ | 400 xato |
| Boshqa seller orderini tahrir qilish | ⏳ | 403 xato |
| Yetarli stock yo'q | ⏳ | 409 xato |
| Kassir tahrir qilishi | ⏳ | Muvaffaqiyatli |

---

## 🎯 KEYINGI QADAM

Agar barcha testlar muvaffaqiyatli bo'lsa:
✅ **Bosqich 5 BAJARILDI**
➡️ **Bosqich 6**: Frontend integratsiyasiga o'tamiz

---

**Postman da test qiling va natijalarni yuboring!** 🚀


## 📋 Test Rejasi

### **Boshlash uchun:**
1. Backend ishga tushgan bo'lishi kerak (Port: 5000)
2. Login qilib, **Bearer Token** olish kerak
3. Kamida 1 ta **draft** order bo'lishi kerak

---

## 🔐 1. LOGIN (Token olish)

### **Seller sifatida login:**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "seller",
  "password": "seller123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "role": "seller",
      "username": "seller"
    }
  }
}
```

**Token ni copy qiling!** 👆

---

### **Kassir sifatida login:**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "sherzod",
  "password": "owner123"
}
```

*(Owner ham cashier rolida ishlaydi)*

---

## 📦 2. DRAFT ORDER YARATISH (Test uchun)

```http
POST http://localhost:5000/api/v1/orders
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "3" },
    { "productId": 4, "quantity": "5" }
  ],
  "customerName": "Test Mijoz",
  "type": "retail",
  "paymentMethod": "cash",
  "exchangeRate": "12800"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "status": "draft",
    "totalAmount": "15000000",
    ...
  },
  "message": "Buyurtma qabul qilindi (Draft)"
}
```

**Order ID ni yozib oling!** (Masalan: `19`)

---

## 🔍 3. BITTA ORDERNI OLISH (GET /orders/:id)

```http
GET http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "status": "draft",
    "customerName": "Test Mijoz",
    "totalAmount": "15000000",
    "items": [
      {
        "id": 45,
        "productId": 2,
        "quantity": "3",
        "price": "2000000",
        "product": {
          "id": 2,
          "name": "iPhone 15 Pro 256GB",
          "stock": "17"
        }
      },
      {
        "id": 46,
        "productId": 4,
        "quantity": "5",
        "price": "1800000",
        "product": {
          "id": 4,
          "name": "Diyor olma",
          "stock": "74"
        }
      }
    ]
  }
}
```

---

## ✏️ 4. ORDERNI TAHRIR QILISH (PUT /orders/:id)

### **Test 1: Mahsulot miqdorini o'zgartirish**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" },
    { "productId": 4, "quantity": "3" }
  ],
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 2: 3 → 5 (2 ta qo'shimcha ombordan ayriladi)
- ✅ Product 4: 5 → 3 (2 ta omborga qaytadi)
- ✅ Total amount qayta hisoblanadi
- ✅ Socket notification yuboriladi

---

### **Test 2: Yangi mahsulot qo'shish**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" },
    { "productId": 4, "quantity": "3" },
    { "productId": 7, "quantity": "10" }
  ],
  "customerName": "Test Mijoz (Updated)",
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 7 qo'shiladi (10 ta ombordan ayriladi)
- ✅ customerName yangilanadi
- ✅ Total amount qayta hisoblanadi

---

### **Test 3: Mahsulot olib tashlash**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" }
  ],
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 4 va 7 olib tashlandi
- ✅ Ularning stocki omborga qaytadi
- ✅ Faqat Product 2 qoladi

---

## ❌ 5. XATO HOLATLARNI TEST QILISH

### **Test 4: Completed orderni tahrir qilishga urinish**

1. Avval orderni Confirm qiling:
```http
PATCH http://localhost:5000/api/v1/orders/19/status
Authorization: Bearer <CASHIER_TOKEN>
Content-Type: application/json

{
  "status": "completed"
}
```

2. Keyin tahrir qilishga harakat qiling:
```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "10" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Faqat kutilayotgan orderlarni tahrir qilish mumkin",
  "statusCode": 400
}
```

---

### **Test 5: Boshqa seller orderni tahrir qilish**

1. **Seller1** order yaratsin (ID: 20)
2. **Seller2** token bilan tahrir qilishga harakat qilsin:

```http
PUT http://localhost:5000/api/v1/orders/20
Authorization: Bearer <SELLER2_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "10" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Bu buyurtma sizga tegishli emas",
  "statusCode": 403
}
```

---

### **Test 6: Omborda yetarli mahsulot yo'q**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "999999" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Omborda yetarli mahsulot yo'q: iPhone 15 Pro 256GB (Mavjud: 17, Kerak: 999999)",
  "statusCode": 409
}
```

---

### **Test 7: Kassir boshqa seller orderini tahrir qilishi**

```http
PUT http://localhost:5000/api/v1/orders/20
Authorization: Bearer <CASHIER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "2" }
  ]
}
```

**Kutilgan natija:**
- ✅ Kassir hamma draft orderlarni tahrir qilishi mumkin
- ✅ Order muvaffaqiyatli yangilanadi

---

## ✅ 6. YAKUNIY TEKSHIRISH

### **Ombor to'g'ri hisoblanganini tekshirish:**

1. Mahsulotlar listini oling:
```http
GET http://localhost:5000/api/v1/products
Authorization: Bearer <TOKEN>
```

2. Stock qiymatlarini tekshiring:
   - Har bir tahrir qilish operatsiyasidan keyin stock to'g'ri o'zgarganini tasdiqlang

---

## 📊 TEST NATIJALARI

| Test | Status | Izoh |
|------|--------|------|
| GET /orders/:id | ⏳ | Bitta orderni olish |
| PUT /orders/:id (miqdor o'zgartirish) | ⏳ | Stock to'g'ri hisoblanadi |
| PUT /orders/:id (mahsulot qo'shish) | ⏳ | Yangi mahsulot qo'shiladi |
| PUT /orders/:id (mahsulot olib tashlash) | ⏳ | Stock qaytadi |
| Completed orderni tahrir qilish | ⏳ | 400 xato |
| Boshqa seller orderini tahrir qilish | ⏳ | 403 xato |
| Yetarli stock yo'q | ⏳ | 409 xato |
| Kassir tahrir qilishi | ⏳ | Muvaffaqiyatli |

---

## 🎯 KEYINGI QADAM

Agar barcha testlar muvaffaqiyatli bo'lsa:
✅ **Bosqich 5 BAJARILDI**
➡️ **Bosqich 6**: Frontend integratsiyasiga o'tamiz

---

**Postman da test qiling va natijalarni yuboring!** 🚀



## 📋 Test Rejasi

### **Boshlash uchun:**
1. Backend ishga tushgan bo'lishi kerak (Port: 5000)
2. Login qilib, **Bearer Token** olish kerak
3. Kamida 1 ta **draft** order bo'lishi kerak

---

## 🔐 1. LOGIN (Token olish)

### **Seller sifatida login:**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "seller",
  "password": "seller123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "role": "seller",
      "username": "seller"
    }
  }
}
```

**Token ni copy qiling!** 👆

---

### **Kassir sifatida login:**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "sherzod",
  "password": "owner123"
}
```

*(Owner ham cashier rolida ishlaydi)*

---

## 📦 2. DRAFT ORDER YARATISH (Test uchun)

```http
POST http://localhost:5000/api/v1/orders
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "3" },
    { "productId": 4, "quantity": "5" }
  ],
  "customerName": "Test Mijoz",
  "type": "retail",
  "paymentMethod": "cash",
  "exchangeRate": "12800"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "status": "draft",
    "totalAmount": "15000000",
    ...
  },
  "message": "Buyurtma qabul qilindi (Draft)"
}
```

**Order ID ni yozib oling!** (Masalan: `19`)

---

## 🔍 3. BITTA ORDERNI OLISH (GET /orders/:id)

```http
GET http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "status": "draft",
    "customerName": "Test Mijoz",
    "totalAmount": "15000000",
    "items": [
      {
        "id": 45,
        "productId": 2,
        "quantity": "3",
        "price": "2000000",
        "product": {
          "id": 2,
          "name": "iPhone 15 Pro 256GB",
          "stock": "17"
        }
      },
      {
        "id": 46,
        "productId": 4,
        "quantity": "5",
        "price": "1800000",
        "product": {
          "id": 4,
          "name": "Diyor olma",
          "stock": "74"
        }
      }
    ]
  }
}
```

---

## ✏️ 4. ORDERNI TAHRIR QILISH (PUT /orders/:id)

### **Test 1: Mahsulot miqdorini o'zgartirish**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" },
    { "productId": 4, "quantity": "3" }
  ],
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 2: 3 → 5 (2 ta qo'shimcha ombordan ayriladi)
- ✅ Product 4: 5 → 3 (2 ta omborga qaytadi)
- ✅ Total amount qayta hisoblanadi
- ✅ Socket notification yuboriladi

---

### **Test 2: Yangi mahsulot qo'shish**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" },
    { "productId": 4, "quantity": "3" },
    { "productId": 7, "quantity": "10" }
  ],
  "customerName": "Test Mijoz (Updated)",
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 7 qo'shiladi (10 ta ombordan ayriladi)
- ✅ customerName yangilanadi
- ✅ Total amount qayta hisoblanadi

---

### **Test 3: Mahsulot olib tashlash**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" }
  ],
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 4 va 7 olib tashlandi
- ✅ Ularning stocki omborga qaytadi
- ✅ Faqat Product 2 qoladi

---

## ❌ 5. XATO HOLATLARNI TEST QILISH

### **Test 4: Completed orderni tahrir qilishga urinish**

1. Avval orderni Confirm qiling:
```http
PATCH http://localhost:5000/api/v1/orders/19/status
Authorization: Bearer <CASHIER_TOKEN>
Content-Type: application/json

{
  "status": "completed"
}
```

2. Keyin tahrir qilishga harakat qiling:
```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "10" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Faqat kutilayotgan orderlarni tahrir qilish mumkin",
  "statusCode": 400
}
```

---

### **Test 5: Boshqa seller orderni tahrir qilish**

1. **Seller1** order yaratsin (ID: 20)
2. **Seller2** token bilan tahrir qilishga harakat qilsin:

```http
PUT http://localhost:5000/api/v1/orders/20
Authorization: Bearer <SELLER2_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "10" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Bu buyurtma sizga tegishli emas",
  "statusCode": 403
}
```

---

### **Test 6: Omborda yetarli mahsulot yo'q**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "999999" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Omborda yetarli mahsulot yo'q: iPhone 15 Pro 256GB (Mavjud: 17, Kerak: 999999)",
  "statusCode": 409
}
```

---

### **Test 7: Kassir boshqa seller orderini tahrir qilishi**

```http
PUT http://localhost:5000/api/v1/orders/20
Authorization: Bearer <CASHIER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "2" }
  ]
}
```

**Kutilgan natija:**
- ✅ Kassir hamma draft orderlarni tahrir qilishi mumkin
- ✅ Order muvaffaqiyatli yangilanadi

---

## ✅ 6. YAKUNIY TEKSHIRISH

### **Ombor to'g'ri hisoblanganini tekshirish:**

1. Mahsulotlar listini oling:
```http
GET http://localhost:5000/api/v1/products
Authorization: Bearer <TOKEN>
```

2. Stock qiymatlarini tekshiring:
   - Har bir tahrir qilish operatsiyasidan keyin stock to'g'ri o'zgarganini tasdiqlang

---

## 📊 TEST NATIJALARI

| Test | Status | Izoh |
|------|--------|------|
| GET /orders/:id | ⏳ | Bitta orderni olish |
| PUT /orders/:id (miqdor o'zgartirish) | ⏳ | Stock to'g'ri hisoblanadi |
| PUT /orders/:id (mahsulot qo'shish) | ⏳ | Yangi mahsulot qo'shiladi |
| PUT /orders/:id (mahsulot olib tashlash) | ⏳ | Stock qaytadi |
| Completed orderni tahrir qilish | ⏳ | 400 xato |
| Boshqa seller orderini tahrir qilish | ⏳ | 403 xato |
| Yetarli stock yo'q | ⏳ | 409 xato |
| Kassir tahrir qilishi | ⏳ | Muvaffaqiyatli |

---

## 🎯 KEYINGI QADAM

Agar barcha testlar muvaffaqiyatli bo'lsa:
✅ **Bosqich 5 BAJARILDI**
➡️ **Bosqich 6**: Frontend integratsiyasiga o'tamiz

---

**Postman da test qiling va natijalarni yuboring!** 🚀


## 📋 Test Rejasi

### **Boshlash uchun:**
1. Backend ishga tushgan bo'lishi kerak (Port: 5000)
2. Login qilib, **Bearer Token** olish kerak
3. Kamida 1 ta **draft** order bo'lishi kerak

---

## 🔐 1. LOGIN (Token olish)

### **Seller sifatida login:**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "seller",
  "password": "seller123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "role": "seller",
      "username": "seller"
    }
  }
}
```

**Token ni copy qiling!** 👆

---

### **Kassir sifatida login:**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "sherzod",
  "password": "owner123"
}
```

*(Owner ham cashier rolida ishlaydi)*

---

## 📦 2. DRAFT ORDER YARATISH (Test uchun)

```http
POST http://localhost:5000/api/v1/orders
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "3" },
    { "productId": 4, "quantity": "5" }
  ],
  "customerName": "Test Mijoz",
  "type": "retail",
  "paymentMethod": "cash",
  "exchangeRate": "12800"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "status": "draft",
    "totalAmount": "15000000",
    ...
  },
  "message": "Buyurtma qabul qilindi (Draft)"
}
```

**Order ID ni yozib oling!** (Masalan: `19`)

---

## 🔍 3. BITTA ORDERNI OLISH (GET /orders/:id)

```http
GET http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "status": "draft",
    "customerName": "Test Mijoz",
    "totalAmount": "15000000",
    "items": [
      {
        "id": 45,
        "productId": 2,
        "quantity": "3",
        "price": "2000000",
        "product": {
          "id": 2,
          "name": "iPhone 15 Pro 256GB",
          "stock": "17"
        }
      },
      {
        "id": 46,
        "productId": 4,
        "quantity": "5",
        "price": "1800000",
        "product": {
          "id": 4,
          "name": "Diyor olma",
          "stock": "74"
        }
      }
    ]
  }
}
```

---

## ✏️ 4. ORDERNI TAHRIR QILISH (PUT /orders/:id)

### **Test 1: Mahsulot miqdorini o'zgartirish**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" },
    { "productId": 4, "quantity": "3" }
  ],
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 2: 3 → 5 (2 ta qo'shimcha ombordan ayriladi)
- ✅ Product 4: 5 → 3 (2 ta omborga qaytadi)
- ✅ Total amount qayta hisoblanadi
- ✅ Socket notification yuboriladi

---

### **Test 2: Yangi mahsulot qo'shish**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" },
    { "productId": 4, "quantity": "3" },
    { "productId": 7, "quantity": "10" }
  ],
  "customerName": "Test Mijoz (Updated)",
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 7 qo'shiladi (10 ta ombordan ayriladi)
- ✅ customerName yangilanadi
- ✅ Total amount qayta hisoblanadi

---

### **Test 3: Mahsulot olib tashlash**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "5" }
  ],
  "exchangeRate": "12800"
}
```

**Kutilgan natija:**
- ✅ Product 4 va 7 olib tashlandi
- ✅ Ularning stocki omborga qaytadi
- ✅ Faqat Product 2 qoladi

---

## ❌ 5. XATO HOLATLARNI TEST QILISH

### **Test 4: Completed orderni tahrir qilishga urinish**

1. Avval orderni Confirm qiling:
```http
PATCH http://localhost:5000/api/v1/orders/19/status
Authorization: Bearer <CASHIER_TOKEN>
Content-Type: application/json

{
  "status": "completed"
}
```

2. Keyin tahrir qilishga harakat qiling:
```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "10" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Faqat kutilayotgan orderlarni tahrir qilish mumkin",
  "statusCode": 400
}
```

---

### **Test 5: Boshqa seller orderni tahrir qilish**

1. **Seller1** order yaratsin (ID: 20)
2. **Seller2** token bilan tahrir qilishga harakat qilsin:

```http
PUT http://localhost:5000/api/v1/orders/20
Authorization: Bearer <SELLER2_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "10" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Bu buyurtma sizga tegishli emas",
  "statusCode": 403
}
```

---

### **Test 6: Omborda yetarli mahsulot yo'q**

```http
PUT http://localhost:5000/api/v1/orders/19
Authorization: Bearer <SELLER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "999999" }
  ]
}
```

**Kutilgan xato:**
```json
{
  "success": false,
  "message": "Omborda yetarli mahsulot yo'q: iPhone 15 Pro 256GB (Mavjud: 17, Kerak: 999999)",
  "statusCode": 409
}
```

---

### **Test 7: Kassir boshqa seller orderini tahrir qilishi**

```http
PUT http://localhost:5000/api/v1/orders/20
Authorization: Bearer <CASHIER_TOKEN>
Content-Type: application/json

{
  "items": [
    { "productId": 2, "quantity": "2" }
  ]
}
```

**Kutilgan natija:**
- ✅ Kassir hamma draft orderlarni tahrir qilishi mumkin
- ✅ Order muvaffaqiyatli yangilanadi

---

## ✅ 6. YAKUNIY TEKSHIRISH

### **Ombor to'g'ri hisoblanganini tekshirish:**

1. Mahsulotlar listini oling:
```http
GET http://localhost:5000/api/v1/products
Authorization: Bearer <TOKEN>
```

2. Stock qiymatlarini tekshiring:
   - Har bir tahrir qilish operatsiyasidan keyin stock to'g'ri o'zgarganini tasdiqlang

---

## 📊 TEST NATIJALARI

| Test | Status | Izoh |
|------|--------|------|
| GET /orders/:id | ⏳ | Bitta orderni olish |
| PUT /orders/:id (miqdor o'zgartirish) | ⏳ | Stock to'g'ri hisoblanadi |
| PUT /orders/:id (mahsulot qo'shish) | ⏳ | Yangi mahsulot qo'shiladi |
| PUT /orders/:id (mahsulot olib tashlash) | ⏳ | Stock qaytadi |
| Completed orderni tahrir qilish | ⏳ | 400 xato |
| Boshqa seller orderini tahrir qilish | ⏳ | 403 xato |
| Yetarli stock yo'q | ⏳ | 409 xato |
| Kassir tahrir qilishi | ⏳ | Muvaffaqiyatli |

---

## 🎯 KEYINGI QADAM

Agar barcha testlar muvaffaqiyatli bo'lsa:
✅ **Bosqich 5 BAJARILDI**
➡️ **Bosqich 6**: Frontend integratsiyasiga o'tamiz

---

**Postman da test qiling va natijalarni yuboring!** 🚀










