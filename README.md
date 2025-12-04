# 🎰 Vegas CRM

> **Professional savdo tizimi** - Modern POS va CRM system for retail businesses

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📋 Mundarija

- [Xususiyatlar](#-xususiyatlar)
- [Texnologiyalar](#-texnologiyalar)
- [O'rnatish](#-ornatish)
- [Ishga Tushirish](#-ishga-tushirish)
- [Arxitektura](#-arxitektura)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Xususiyatlar

### 🏪 POS (Point of Sale)
- ✅ Real-time mahsulot qidirish
- ✅ Kategoriya bo'yicha filter
- ✅ Savat boshqaruvi
- ✅ USD/UZS valyuta qo'llab-quvvatlash
- ✅ Kunlik kurs avtomatik yangilanishi (CBU.uz)
- ✅ Turli to'lov usullari (Naqd, Karta, O'tkazma, Nasiya)
- ✅ Chek chop etish

### 📊 Admin Panel
- ✅ Buyurtmalar boshqaruvi
- ✅ Mahsulotlar CRUD
- ✅ Kategoriyalar CRUD
- ✅ Real-time yangilanishlar (Socket.io)
- ✅ Dashboard statistikasi
- ✅ Pie Chart (kategoriya bo'yicha savdo)
- ✅ Line Chart (kunlik savdo dinamikasi)

### 👥 Owner Dashboard
- ✅ Biznes statistikasi
- ✅ Xodimlar boshqaruvi
- ✅ Top mahsulotlar
- ✅ Top sotuvchilar
- ✅ Kategoriya bo'yicha tahlil

### 🔐 Xavfsizlik
- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Input Sanitization (XSS prevention)
- ✅ Rate Limiting (Brute force protection)
- ✅ SQL Injection prevention
- ✅ Error Boundary
- ✅ Environment variables

### ⚡ Performance
- ✅ Database indexes (15+)
- ✅ Query optimization (50-80% faster)
- ✅ Type-safe API calls
- ✅ Code splitting
- ✅ Lazy loading

---

## 🛠 Texnologiyalar

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **State Management:** TanStack Query (React Query)
- **Real-time:** Socket.io Client
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Authentication:** NextAuth.js

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Real-time:** Socket.io
- **Authentication:** JWT
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Winston

### DevOps
- **Package Manager:** pnpm
- **Database Migrations:** Drizzle Kit
- **Environment:** dotenv
- **Process Manager:** PM2 (production)

---

## 📦 O'rnatish

### Talablar
- Node.js 18+ 
- PostgreSQL 14+
- pnpm 8+

### 1. Repository ni clone qilish
```bash
git clone https://github.com/your-username/vegas-crm.git
cd vegas-crm
```

### 2. Dependencies o'rnatish

#### Backend
```bash
cd backend
pnpm install
```

#### Frontend
```bash
cd client
pnpm install
```

### 3. Environment variables sozlash

#### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/vegas_crm

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend `.env.local`
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
```

### 4. Database setup
```bash
cd backend

# Database yaratish
createdb vegas_crm

# Migrations run qilish
pnpm drizzle-kit push

# Seed data (Owner user yaratish)
pnpm seed
```

**Default Login:**
- Username: `admin`
- Password: `password123`

---

## 🚀 Ishga Tushirish

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
pnpm dev
# Server: http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd client
pnpm dev
# App: http://localhost:3000
```

### Production Mode

#### Backend
```bash
cd backend
pnpm build
pnpm start
# yoki PM2 bilan
pm2 start dist/server.js --name vegas-backend
```

#### Frontend
```bash
cd client
pnpm build
pnpm start
# yoki PM2 bilan
pm2 start npm --name vegas-frontend -- start
```

---

## 🏗 Arxitektura

### Frontend Structure
```
client/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin pages
│   ├── (owner)/           # Owner pages
│   ├── (seller)/          # Seller pages
│   └── (auth)/            # Auth pages
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   └── orders/           # Order components
├── lib/                   # Utilities
│   ├── api/              # API client
│   ├── services/         # API services
│   ├── constants/        # Constants
│   └── validations/      # Zod schemas
├── providers/            # Context providers
├── hooks/                # Custom hooks
└── types/                # TypeScript types
```

### Backend Structure
```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/
│   │   ├── product/
│   │   ├── category/
│   │   ├── order/
│   │   ├── user/
│   │   └── stats/
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.ts
│   │   ├── sanitize.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── db/               # Database
│   │   ├── schema.ts
│   │   └── seed.ts
│   ├── utils/            # Utilities
│   └── server.ts         # Entry point
└── drizzle/              # Migrations
```

---

## 📚 API Documentation

### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Products
```http
# Get all products
GET /api/v1/products?search=cola&categoryId=1

# Create product
POST /api/v1/products
Authorization: Bearer {token}

# Update product
PATCH /api/v1/products/:id
Authorization: Bearer {token}

# Delete product
DELETE /api/v1/products/:id
Authorization: Bearer {token}
```

### Orders
```http
# Get all orders (Admin/Owner only)
GET /api/v1/orders
Authorization: Bearer {token}

# Create order
POST /api/v1/orders
Authorization: Bearer {token}

# Update order status
PATCH /api/v1/orders/:id/status
Authorization: Bearer {token}
```

**Full API Documentation:** [Swagger UI](http://localhost:5000/api-docs) (Coming soon)

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd client
vercel --prod
```

### Railway/Render (Backend)
```bash
cd backend
# Set environment variables
# Deploy via Git push
```

### Docker
```bash
# Coming soon
docker-compose up -d
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript
- Follow ESLint rules
- Write meaningful commit messages
- Add JSDoc comments for functions

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Vegas CRM Team**
- GitHub: [@your-username](https://github.com/your-username)
- Email: support@vegas-crm.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TanStack Query](https://tanstack.com/query)

---

## 📊 Project Stats

- **Lines of Code:** 15,000+
- **Components:** 50+
- **API Endpoints:** 20+
- **Database Tables:** 8
- **Test Coverage:** 0% (Coming soon)

---

**Made with ❤️ in Uzbekistan**
> **Professional savdo tizimi** - Modern POS va CRM system for retail businesses

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📋 Mundarija

- [Xususiyatlar](#-xususiyatlar)
- [Texnologiyalar](#-texnologiyalar)
- [O'rnatish](#-ornatish)
- [Ishga Tushirish](#-ishga-tushirish)
- [Arxitektura](#-arxitektura)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Xususiyatlar

### 🏪 POS (Point of Sale)
- ✅ Real-time mahsulot qidirish
- ✅ Kategoriya bo'yicha filter
- ✅ Savat boshqaruvi
- ✅ USD/UZS valyuta qo'llab-quvvatlash
- ✅ Kunlik kurs avtomatik yangilanishi (CBU.uz)
- ✅ Turli to'lov usullari (Naqd, Karta, O'tkazma, Nasiya)
- ✅ Chek chop etish

### 📊 Admin Panel
- ✅ Buyurtmalar boshqaruvi
- ✅ Mahsulotlar CRUD
- ✅ Kategoriyalar CRUD
- ✅ Real-time yangilanishlar (Socket.io)
- ✅ Dashboard statistikasi
- ✅ Pie Chart (kategoriya bo'yicha savdo)
- ✅ Line Chart (kunlik savdo dinamikasi)

### 👥 Owner Dashboard
- ✅ Biznes statistikasi
- ✅ Xodimlar boshqaruvi
- ✅ Top mahsulotlar
- ✅ Top sotuvchilar
- ✅ Kategoriya bo'yicha tahlil

### 🔐 Xavfsizlik
- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Input Sanitization (XSS prevention)
- ✅ Rate Limiting (Brute force protection)
- ✅ SQL Injection prevention
- ✅ Error Boundary
- ✅ Environment variables

### ⚡ Performance
- ✅ Database indexes (15+)
- ✅ Query optimization (50-80% faster)
- ✅ Type-safe API calls
- ✅ Code splitting
- ✅ Lazy loading

---

## 🛠 Texnologiyalar

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **State Management:** TanStack Query (React Query)
- **Real-time:** Socket.io Client
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Authentication:** NextAuth.js

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Real-time:** Socket.io
- **Authentication:** JWT
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Winston

### DevOps
- **Package Manager:** pnpm
- **Database Migrations:** Drizzle Kit
- **Environment:** dotenv
- **Process Manager:** PM2 (production)

---

## 📦 O'rnatish

### Talablar
- Node.js 18+ 
- PostgreSQL 14+
- pnpm 8+

### 1. Repository ni clone qilish
```bash
git clone https://github.com/your-username/vegas-crm.git
cd vegas-crm
```

### 2. Dependencies o'rnatish

#### Backend
```bash
cd backend
pnpm install
```

#### Frontend
```bash
cd client
pnpm install
```

### 3. Environment variables sozlash

#### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/vegas_crm

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend `.env.local`
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
```

### 4. Database setup
```bash
cd backend

# Database yaratish
createdb vegas_crm

# Migrations run qilish
pnpm drizzle-kit push

# Seed data (Owner user yaratish)
pnpm seed
```

**Default Login:**
- Username: `admin`
- Password: `password123`

---

## 🚀 Ishga Tushirish

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
pnpm dev
# Server: http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd client
pnpm dev
# App: http://localhost:3000
```

### Production Mode

#### Backend
```bash
cd backend
pnpm build
pnpm start
# yoki PM2 bilan
pm2 start dist/server.js --name vegas-backend
```

#### Frontend
```bash
cd client
pnpm build
pnpm start
# yoki PM2 bilan
pm2 start npm --name vegas-frontend -- start
```

---

## 🏗 Arxitektura

### Frontend Structure
```
client/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin pages
│   ├── (owner)/           # Owner pages
│   ├── (seller)/          # Seller pages
│   └── (auth)/            # Auth pages
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   └── orders/           # Order components
├── lib/                   # Utilities
│   ├── api/              # API client
│   ├── services/         # API services
│   ├── constants/        # Constants
│   └── validations/      # Zod schemas
├── providers/            # Context providers
├── hooks/                # Custom hooks
└── types/                # TypeScript types
```

### Backend Structure
```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/
│   │   ├── product/
│   │   ├── category/
│   │   ├── order/
│   │   ├── user/
│   │   └── stats/
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.ts
│   │   ├── sanitize.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── db/               # Database
│   │   ├── schema.ts
│   │   └── seed.ts
│   ├── utils/            # Utilities
│   └── server.ts         # Entry point
└── drizzle/              # Migrations
```

---

## 📚 API Documentation

### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Products
```http
# Get all products
GET /api/v1/products?search=cola&categoryId=1

# Create product
POST /api/v1/products
Authorization: Bearer {token}

# Update product
PATCH /api/v1/products/:id
Authorization: Bearer {token}

# Delete product
DELETE /api/v1/products/:id
Authorization: Bearer {token}
```

### Orders
```http
# Get all orders (Admin/Owner only)
GET /api/v1/orders
Authorization: Bearer {token}

# Create order
POST /api/v1/orders
Authorization: Bearer {token}

# Update order status
PATCH /api/v1/orders/:id/status
Authorization: Bearer {token}
```

**Full API Documentation:** [Swagger UI](http://localhost:5000/api-docs) (Coming soon)

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd client
vercel --prod
```

### Railway/Render (Backend)
```bash
cd backend
# Set environment variables
# Deploy via Git push
```

### Docker
```bash
# Coming soon
docker-compose up -d
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript
- Follow ESLint rules
- Write meaningful commit messages
- Add JSDoc comments for functions

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Vegas CRM Team**
- GitHub: [@your-username](https://github.com/your-username)
- Email: support@vegas-crm.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TanStack Query](https://tanstack.com/query)

---

## 📊 Project Stats

- **Lines of Code:** 15,000+
- **Components:** 50+
- **API Endpoints:** 20+
- **Database Tables:** 8
- **Test Coverage:** 0% (Coming soon)

---

**Made with ❤️ in Uzbekistan**

> **Professional savdo tizimi** - Modern POS va CRM system for retail businesses

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📋 Mundarija

- [Xususiyatlar](#-xususiyatlar)
- [Texnologiyalar](#-texnologiyalar)
- [O'rnatish](#-ornatish)
- [Ishga Tushirish](#-ishga-tushirish)
- [Arxitektura](#-arxitektura)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Xususiyatlar

### 🏪 POS (Point of Sale)
- ✅ Real-time mahsulot qidirish
- ✅ Kategoriya bo'yicha filter
- ✅ Savat boshqaruvi
- ✅ USD/UZS valyuta qo'llab-quvvatlash
- ✅ Kunlik kurs avtomatik yangilanishi (CBU.uz)
- ✅ Turli to'lov usullari (Naqd, Karta, O'tkazma, Nasiya)
- ✅ Chek chop etish

### 📊 Admin Panel
- ✅ Buyurtmalar boshqaruvi
- ✅ Mahsulotlar CRUD
- ✅ Kategoriyalar CRUD
- ✅ Real-time yangilanishlar (Socket.io)
- ✅ Dashboard statistikasi
- ✅ Pie Chart (kategoriya bo'yicha savdo)
- ✅ Line Chart (kunlik savdo dinamikasi)

### 👥 Owner Dashboard
- ✅ Biznes statistikasi
- ✅ Xodimlar boshqaruvi
- ✅ Top mahsulotlar
- ✅ Top sotuvchilar
- ✅ Kategoriya bo'yicha tahlil

### 🔐 Xavfsizlik
- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Input Sanitization (XSS prevention)
- ✅ Rate Limiting (Brute force protection)
- ✅ SQL Injection prevention
- ✅ Error Boundary
- ✅ Environment variables

### ⚡ Performance
- ✅ Database indexes (15+)
- ✅ Query optimization (50-80% faster)
- ✅ Type-safe API calls
- ✅ Code splitting
- ✅ Lazy loading

---

## 🛠 Texnologiyalar

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **State Management:** TanStack Query (React Query)
- **Real-time:** Socket.io Client
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Authentication:** NextAuth.js

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Real-time:** Socket.io
- **Authentication:** JWT
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Winston

### DevOps
- **Package Manager:** pnpm
- **Database Migrations:** Drizzle Kit
- **Environment:** dotenv
- **Process Manager:** PM2 (production)

---

## 📦 O'rnatish

### Talablar
- Node.js 18+ 
- PostgreSQL 14+
- pnpm 8+

### 1. Repository ni clone qilish
```bash
git clone https://github.com/your-username/vegas-crm.git
cd vegas-crm
```

### 2. Dependencies o'rnatish

#### Backend
```bash
cd backend
pnpm install
```

#### Frontend
```bash
cd client
pnpm install
```

### 3. Environment variables sozlash

#### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/vegas_crm

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend `.env.local`
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
```

### 4. Database setup
```bash
cd backend

# Database yaratish
createdb vegas_crm

# Migrations run qilish
pnpm drizzle-kit push

# Seed data (Owner user yaratish)
pnpm seed
```

**Default Login:**
- Username: `admin`
- Password: `password123`

---

## 🚀 Ishga Tushirish

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
pnpm dev
# Server: http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd client
pnpm dev
# App: http://localhost:3000
```

### Production Mode

#### Backend
```bash
cd backend
pnpm build
pnpm start
# yoki PM2 bilan
pm2 start dist/server.js --name vegas-backend
```

#### Frontend
```bash
cd client
pnpm build
pnpm start
# yoki PM2 bilan
pm2 start npm --name vegas-frontend -- start
```

---

## 🏗 Arxitektura

### Frontend Structure
```
client/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin pages
│   ├── (owner)/           # Owner pages
│   ├── (seller)/          # Seller pages
│   └── (auth)/            # Auth pages
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   └── orders/           # Order components
├── lib/                   # Utilities
│   ├── api/              # API client
│   ├── services/         # API services
│   ├── constants/        # Constants
│   └── validations/      # Zod schemas
├── providers/            # Context providers
├── hooks/                # Custom hooks
└── types/                # TypeScript types
```

### Backend Structure
```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/
│   │   ├── product/
│   │   ├── category/
│   │   ├── order/
│   │   ├── user/
│   │   └── stats/
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.ts
│   │   ├── sanitize.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── db/               # Database
│   │   ├── schema.ts
│   │   └── seed.ts
│   ├── utils/            # Utilities
│   └── server.ts         # Entry point
└── drizzle/              # Migrations
```

---

## 📚 API Documentation

### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Products
```http
# Get all products
GET /api/v1/products?search=cola&categoryId=1

# Create product
POST /api/v1/products
Authorization: Bearer {token}

# Update product
PATCH /api/v1/products/:id
Authorization: Bearer {token}

# Delete product
DELETE /api/v1/products/:id
Authorization: Bearer {token}
```

### Orders
```http
# Get all orders (Admin/Owner only)
GET /api/v1/orders
Authorization: Bearer {token}

# Create order
POST /api/v1/orders
Authorization: Bearer {token}

# Update order status
PATCH /api/v1/orders/:id/status
Authorization: Bearer {token}
```

**Full API Documentation:** [Swagger UI](http://localhost:5000/api-docs) (Coming soon)

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd client
vercel --prod
```

### Railway/Render (Backend)
```bash
cd backend
# Set environment variables
# Deploy via Git push
```

### Docker
```bash
# Coming soon
docker-compose up -d
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript
- Follow ESLint rules
- Write meaningful commit messages
- Add JSDoc comments for functions

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Vegas CRM Team**
- GitHub: [@your-username](https://github.com/your-username)
- Email: support@vegas-crm.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TanStack Query](https://tanstack.com/query)

---

## 📊 Project Stats

- **Lines of Code:** 15,000+
- **Components:** 50+
- **API Endpoints:** 20+
- **Database Tables:** 8
- **Test Coverage:** 0% (Coming soon)

---

**Made with ❤️ in Uzbekistan**
> **Professional savdo tizimi** - Modern POS va CRM system for retail businesses

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📋 Mundarija

- [Xususiyatlar](#-xususiyatlar)
- [Texnologiyalar](#-texnologiyalar)
- [O'rnatish](#-ornatish)
- [Ishga Tushirish](#-ishga-tushirish)
- [Arxitektura](#-arxitektura)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Xususiyatlar

### 🏪 POS (Point of Sale)
- ✅ Real-time mahsulot qidirish
- ✅ Kategoriya bo'yicha filter
- ✅ Savat boshqaruvi
- ✅ USD/UZS valyuta qo'llab-quvvatlash
- ✅ Kunlik kurs avtomatik yangilanishi (CBU.uz)
- ✅ Turli to'lov usullari (Naqd, Karta, O'tkazma, Nasiya)
- ✅ Chek chop etish

### 📊 Admin Panel
- ✅ Buyurtmalar boshqaruvi
- ✅ Mahsulotlar CRUD
- ✅ Kategoriyalar CRUD
- ✅ Real-time yangilanishlar (Socket.io)
- ✅ Dashboard statistikasi
- ✅ Pie Chart (kategoriya bo'yicha savdo)
- ✅ Line Chart (kunlik savdo dinamikasi)

### 👥 Owner Dashboard
- ✅ Biznes statistikasi
- ✅ Xodimlar boshqaruvi
- ✅ Top mahsulotlar
- ✅ Top sotuvchilar
- ✅ Kategoriya bo'yicha tahlil

### 🔐 Xavfsizlik
- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Input Sanitization (XSS prevention)
- ✅ Rate Limiting (Brute force protection)
- ✅ SQL Injection prevention
- ✅ Error Boundary
- ✅ Environment variables

### ⚡ Performance
- ✅ Database indexes (15+)
- ✅ Query optimization (50-80% faster)
- ✅ Type-safe API calls
- ✅ Code splitting
- ✅ Lazy loading

---

## 🛠 Texnologiyalar

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **State Management:** TanStack Query (React Query)
- **Real-time:** Socket.io Client
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Authentication:** NextAuth.js

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Real-time:** Socket.io
- **Authentication:** JWT
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Winston

### DevOps
- **Package Manager:** pnpm
- **Database Migrations:** Drizzle Kit
- **Environment:** dotenv
- **Process Manager:** PM2 (production)

---

## 📦 O'rnatish

### Talablar
- Node.js 18+ 
- PostgreSQL 14+
- pnpm 8+

### 1. Repository ni clone qilish
```bash
git clone https://github.com/your-username/vegas-crm.git
cd vegas-crm
```

### 2. Dependencies o'rnatish

#### Backend
```bash
cd backend
pnpm install
```

#### Frontend
```bash
cd client
pnpm install
```

### 3. Environment variables sozlash

#### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/vegas_crm

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend `.env.local`
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
```

### 4. Database setup
```bash
cd backend

# Database yaratish
createdb vegas_crm

# Migrations run qilish
pnpm drizzle-kit push

# Seed data (Owner user yaratish)
pnpm seed
```

**Default Login:**
- Username: `admin`
- Password: `password123`

---

## 🚀 Ishga Tushirish

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
pnpm dev
# Server: http://localhost:5000
```

#### Terminal 2 - Frontend
```bash
cd client
pnpm dev
# App: http://localhost:3000
```

### Production Mode

#### Backend
```bash
cd backend
pnpm build
pnpm start
# yoki PM2 bilan
pm2 start dist/server.js --name vegas-backend
```

#### Frontend
```bash
cd client
pnpm build
pnpm start
# yoki PM2 bilan
pm2 start npm --name vegas-frontend -- start
```

---

## 🏗 Arxitektura

### Frontend Structure
```
client/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin pages
│   ├── (owner)/           # Owner pages
│   ├── (seller)/          # Seller pages
│   └── (auth)/            # Auth pages
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   └── orders/           # Order components
├── lib/                   # Utilities
│   ├── api/              # API client
│   ├── services/         # API services
│   ├── constants/        # Constants
│   └── validations/      # Zod schemas
├── providers/            # Context providers
├── hooks/                # Custom hooks
└── types/                # TypeScript types
```

### Backend Structure
```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/
│   │   ├── product/
│   │   ├── category/
│   │   ├── order/
│   │   ├── user/
│   │   └── stats/
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.ts
│   │   ├── sanitize.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── db/               # Database
│   │   ├── schema.ts
│   │   └── seed.ts
│   ├── utils/            # Utilities
│   └── server.ts         # Entry point
└── drizzle/              # Migrations
```

---

## 📚 API Documentation

### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Products
```http
# Get all products
GET /api/v1/products?search=cola&categoryId=1

# Create product
POST /api/v1/products
Authorization: Bearer {token}

# Update product
PATCH /api/v1/products/:id
Authorization: Bearer {token}

# Delete product
DELETE /api/v1/products/:id
Authorization: Bearer {token}
```

### Orders
```http
# Get all orders (Admin/Owner only)
GET /api/v1/orders
Authorization: Bearer {token}

# Create order
POST /api/v1/orders
Authorization: Bearer {token}

# Update order status
PATCH /api/v1/orders/:id/status
Authorization: Bearer {token}
```

**Full API Documentation:** [Swagger UI](http://localhost:5000/api-docs) (Coming soon)

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd client
vercel --prod
```

### Railway/Render (Backend)
```bash
cd backend
# Set environment variables
# Deploy via Git push
```

### Docker
```bash
# Coming soon
docker-compose up -d
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript
- Follow ESLint rules
- Write meaningful commit messages
- Add JSDoc comments for functions

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Vegas CRM Team**
- GitHub: [@your-username](https://github.com/your-username)
- Email: support@vegas-crm.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TanStack Query](https://tanstack.com/query)

---

## 📊 Project Stats

- **Lines of Code:** 15,000+
- **Components:** 50+
- **API Endpoints:** 20+
- **Database Tables:** 8
- **Test Coverage:** 0% (Coming soon)

---

**Made with ❤️ in Uzbekistan**
