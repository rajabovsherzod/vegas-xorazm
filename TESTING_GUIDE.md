# 🧪 VEGAS CRM - TESTING & MONITORING GUIDE

## 📊 **1. SENTRY MONITORING - Setup & Testing**

### **1.1. Sentry Account Yaratish**

1. **Sentry.io ga kirish:**
   ```
   https://sentry.io/signup/
   ```

2. **Yangi Project yaratish:**
   - Project nomi: `vegas-crm-frontend`
   - Platform: `Next.js`
   - DSN ni nusxalash

3. **Backend uchun ham:**
   - Project nomi: `vegas-crm-backend`
   - Platform: `Node.js`
   - DSN ni nusxalash

### **1.2. Environment Variables Sozlash**

**Frontend (`client/.env`):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
```

**Backend (`backend/.env`):**
```bash
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/789012
```

### **1.3. Sentry ni Tekshirish**

#### **Frontend Test:**

**Test 1: Manual Error**
```typescript
// client/app/test-sentry/page.tsx
'use client';

export default function TestSentry() {
  const throwError = () => {
    throw new Error("Frontend Sentry Test Error!");
  };

  return (
    <div className="p-8">
      <h1>Sentry Test</h1>
      <button 
        onClick={throwError}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Test Sentry Error
      </button>
    </div>
  );
}
```

**Test 2: API Error**
```bash
# Browser console da
fetch('/api/non-existent').catch(console.error)
```

#### **Backend Test:**

**Test Script yaratish:**
```typescript
// backend/src/test-sentry.ts
import * as Sentry from "@sentry/node";
import { initSentry } from "./config/sentry";

initSentry();

// Test error
try {
  throw new Error("Backend Sentry Test Error!");
} catch (error) {
  Sentry.captureException(error);
  console.log("✅ Error sent to Sentry!");
}

// Test message
Sentry.captureMessage("Backend Sentry Test Message", "info");

// Flush events
Sentry.close(2000).then(() => {
  console.log("✅ All events flushed to Sentry!");
  process.exit(0);
});
```

**Ishga tushirish:**
```bash
cd backend
npx tsx src/test-sentry.ts
```

### **1.4. Sentry Dashboard Tekshirish**

1. **https://sentry.io** ga kiring
2. **Issues** bo'limiga o'ting
3. Yangi xatolarni ko'ring:
   - Error message
   - Stack trace
   - User context
   - Browser/OS info
   - Performance metrics

---

## 🐳 **2. DOCKER - Backend Deploy Tayyorligi**

### **2.1. Docker Build Test**

#### **Backend Docker Image:**
```bash
cd backend

# Build
docker build -t vegas-backend:test .

# Test run
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="test-secret" \
  vegas-backend:test
```

#### **Frontend Docker Image:**
```bash
cd client

# Build
docker build -t vegas-frontend:test \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 \
  --build-arg NEXT_PUBLIC_WS_URL=http://localhost:5000 \
  --build-arg NEXTAUTH_SECRET=test-secret \
  .

# Test run
docker run -p 3000:3000 vegas-frontend:test
```

### **2.2. Docker Compose Test**

**To'liq tizimni ishga tushirish:**
```bash
# Root directory da
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f

# Statusni tekshirish
docker-compose ps

# Health check
curl http://localhost:5000/health
curl http://localhost:3000

# To'xtatish
docker-compose down
```

### **2.3. Production Deploy Checklist**

**✅ Tekshirish ro'yxati:**

- [ ] Environment variables to'g'ri sozlangan
- [ ] Database migration bajarilgan
- [ ] SSL sertifikatlari o'rnatilgan
- [ ] Firewall sozlangan (faqat 80, 443 portlar ochiq)
- [ ] Backup strategiyasi mavjud
- [ ] Monitoring sozlangan (Sentry)
- [ ] Logging sozlangan (Winston)
- [ ] Health check endpointlari ishlayapti
- [ ] Rate limiting yoqilgan
- [ ] CORS to'g'ri sozlangan

**Production Environment Variables:**
```bash
# Backend
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=super-secure-secret-min-32-chars
SENTRY_DSN=https://...

# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=super-secure-secret-min-32-chars
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 🧪 **3. JEST TESTING - Frontend & Backend**

### **3.1. Frontend Tests**

#### **Test Run:**
```bash
cd client

# Barcha testlar
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

#### **Yangi Test Yozish:**

**Example: Product Service Test**
```typescript
// client/__tests__/lib/services/product.test.ts
import { productService } from '@/lib/services/product.service';

// Mock API client
jest.mock('@/lib/api/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Product Service', () => {
  it('should fetch all products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: '10000' },
      { id: 2, name: 'Product 2', price: '20000' },
    ];

    const { api } = require('@/lib/api/api-client');
    api.get.mockResolvedValue({ products: mockProducts, pagination: {} });

    const result = await productService.getAll();
    
    expect(result.products).toEqual(mockProducts);
    expect(api.get).toHaveBeenCalledWith('/products');
  });

  it('should create a product', async () => {
    const newProduct = {
      name: 'New Product',
      price: '15000',
      categoryId: 1,
      stock: '100',
      unit: 'dona',
    };

    const { api } = require('@/lib/api/api-client');
    api.post.mockResolvedValue({ id: 3, ...newProduct });

    const result = await productService.create(newProduct);
    
    expect(result.name).toBe('New Product');
    expect(api.post).toHaveBeenCalledWith('/products', newProduct);
  });
});
```

**Example: Component Test**
```typescript
// client/__tests__/components/orders/order-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard } from '@/components/orders/order-card';

const mockOrder = {
  id: 1,
  status: 'pending',
  totalAmount: '100000',
  paymentMethod: 'cash',
  items: [],
  createdAt: new Date().toISOString(),
};

describe('OrderCard', () => {
  it('should render order details', () => {
    const onViewDetails = jest.fn();
    
    render(
      <OrderCard 
        order={mockOrder} 
        onViewDetails={onViewDetails}
      />
    );
    
    expect(screen.getByText(/100,000/)).toBeInTheDocument();
    expect(screen.getByText(/Naqd/)).toBeInTheDocument();
  });

  it('should call onViewDetails when clicked', () => {
    const onViewDetails = jest.fn();
    
    render(
      <OrderCard 
        order={mockOrder} 
        onViewDetails={onViewDetails}
      />
    );
    
    const detailButton = screen.getByText(/Batafsil/);
    fireEvent.click(detailButton);
    
    expect(onViewDetails).toHaveBeenCalledWith(mockOrder);
  });
});
```

### **3.2. Backend Tests (Setup)**

#### **Backend Test Setup:**

**1. Install Dependencies:**
```bash
cd backend
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**2. Jest Config:**
```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
```

**3. Example Test:**
```typescript
// backend/src/__tests__/modules/product/service.test.ts
import { productService } from '@/modules/product/service';
import { db } from '@/db';

jest.mock('@/db');

describe('Product Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: '10000' },
        { id: 2, name: 'Product 2', price: '20000' },
      ];

      (db.query.products.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll({});
      
      expect(result).toEqual(mockProducts);
      expect(db.query.products.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: '15000',
        categoryId: 1,
        stock: '100',
        unit: 'dona',
      };

      const createdProduct = { id: 3, ...newProduct };
      
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdProduct]),
        }),
      });

      const result = await productService.create(newProduct);
      
      expect(result.name).toBe('New Product');
    });
  });
});
```

**4. API Endpoint Test:**
```typescript
// backend/src/__tests__/modules/product/routes.test.ts
import request from 'supertest';
import express from 'express';
import productRoutes from '@/modules/product/routes';

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes', () => {
  describe('GET /products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        price: '10000',
        categoryId: 1,
        stock: '100',
        unit: 'dona',
        barcode: '123456',
      };

      const response = await request(app)
        .post('/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Product');
    });

    it('should return 400 for invalid data', async () => {
      const invalidProduct = {
        name: '', // Invalid: empty name
      };

      await request(app)
        .post('/products')
        .send(invalidProduct)
        .expect(400);
    });
  });
});
```

**5. Run Tests:**
```bash
cd backend

# Add to package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}

# Run
pnpm test
```

---

## 📊 **4. FULL SYSTEM TEST**

### **4.1. Integration Test Script**

```bash
#!/bin/bash
# test-all.sh

echo "🧪 Starting Full System Test..."

# 1. Backend Tests
echo "📦 Testing Backend..."
cd backend
pnpm test || exit 1

# 2. Frontend Tests
echo "🎨 Testing Frontend..."
cd ../client
pnpm test || exit 1

# 3. Build Tests
echo "🏗️  Testing Builds..."
cd ../backend
pnpm build || exit 1

cd ../client
pnpm build || exit 1

# 4. Docker Tests
echo "🐳 Testing Docker..."
cd ..
docker-compose build || exit 1

# 5. Health Checks
echo "🏥 Testing Health Checks..."
docker-compose up -d
sleep 10

curl -f http://localhost:5000/health || exit 1
curl -f http://localhost:3000 || exit 1

docker-compose down

echo "✅ All tests passed!"
```

### **4.2. CI/CD Test**

**GitHub Actions da avtomatik test:**
```bash
# .github/workflows/ci.yml allaqachon mavjud
# Har bir push/PR da avtomatik ishga tushadi

# Manual trigger:
git push origin main
```

---

## 📈 **5. MONITORING DASHBOARD**

### **5.1. Sentry Dashboard**

**Ko'riladigan metrikalar:**
- ✅ Error rate (xatolar soni)
- ✅ Performance (sahifa yuklanish vaqti)
- ✅ User sessions (foydalanuvchi sessiyalari)
- ✅ Release tracking (versiya kuzatuvi)
- ✅ Source maps (kod joylashuvi)

### **5.2. Application Logs**

**Backend logs:**
```bash
# Development
tail -f backend/logs/combined.log

# Production (Docker)
docker-compose logs -f backend
```

**Frontend logs:**
```bash
# Development
# Browser console

# Production (Docker)
docker-compose logs -f frontend
```

---

## ✅ **6. PRODUCTION READINESS CHECKLIST**

### **Security:**
- [x] Environment variables (no hardcoded secrets)
- [x] Input sanitization (XSS, SQL injection)
- [x] Rate limiting
- [x] CORS configured
- [x] Helmet security headers
- [x] JWT authentication
- [x] HTTPS (production)

### **Performance:**
- [x] Database indexes
- [x] Query optimization
- [x] Bundle optimization
- [x] Image optimization
- [x] Caching strategy
- [x] Code splitting

### **Monitoring:**
- [x] Error tracking (Sentry)
- [x] Logging (Winston)
- [x] Health checks
- [x] Performance monitoring

### **Testing:**
- [x] Unit tests
- [x] Component tests
- [x] API tests (setup ready)
- [ ] Integration tests (optional)
- [ ] E2E tests (optional)

### **DevOps:**
- [x] Docker setup
- [x] docker-compose
- [x] CI/CD pipeline
- [x] Automated tests
- [x] Security scanning

---

## 🎯 **QUICK START COMMANDS**

```bash
# 1. Frontend tests
cd client && pnpm test

# 2. Backend tests (after setup)
cd backend && pnpm test

# 3. Docker build
docker-compose build

# 4. Docker run
docker-compose up -d

# 5. Health check
curl http://localhost:5000/health
curl http://localhost:3000

# 6. View logs
docker-compose logs -f

# 7. Stop
docker-compose down
```

---

**Yaratilgan:** 2025-12-02  
**Status:** ✅ **PRODUCTION-READY**








## 📊 **1. SENTRY MONITORING - Setup & Testing**

### **1.1. Sentry Account Yaratish**

1. **Sentry.io ga kirish:**
   ```
   https://sentry.io/signup/
   ```

2. **Yangi Project yaratish:**
   - Project nomi: `vegas-crm-frontend`
   - Platform: `Next.js`
   - DSN ni nusxalash

3. **Backend uchun ham:**
   - Project nomi: `vegas-crm-backend`
   - Platform: `Node.js`
   - DSN ni nusxalash

### **1.2. Environment Variables Sozlash**

**Frontend (`client/.env`):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
```

**Backend (`backend/.env`):**
```bash
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/789012
```

### **1.3. Sentry ni Tekshirish**

#### **Frontend Test:**

**Test 1: Manual Error**
```typescript
// client/app/test-sentry/page.tsx
'use client';

export default function TestSentry() {
  const throwError = () => {
    throw new Error("Frontend Sentry Test Error!");
  };

  return (
    <div className="p-8">
      <h1>Sentry Test</h1>
      <button 
        onClick={throwError}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Test Sentry Error
      </button>
    </div>
  );
}
```

**Test 2: API Error**
```bash
# Browser console da
fetch('/api/non-existent').catch(console.error)
```

#### **Backend Test:**

**Test Script yaratish:**
```typescript
// backend/src/test-sentry.ts
import * as Sentry from "@sentry/node";
import { initSentry } from "./config/sentry";

initSentry();

// Test error
try {
  throw new Error("Backend Sentry Test Error!");
} catch (error) {
  Sentry.captureException(error);
  console.log("✅ Error sent to Sentry!");
}

// Test message
Sentry.captureMessage("Backend Sentry Test Message", "info");

// Flush events
Sentry.close(2000).then(() => {
  console.log("✅ All events flushed to Sentry!");
  process.exit(0);
});
```

**Ishga tushirish:**
```bash
cd backend
npx tsx src/test-sentry.ts
```

### **1.4. Sentry Dashboard Tekshirish**

1. **https://sentry.io** ga kiring
2. **Issues** bo'limiga o'ting
3. Yangi xatolarni ko'ring:
   - Error message
   - Stack trace
   - User context
   - Browser/OS info
   - Performance metrics

---

## 🐳 **2. DOCKER - Backend Deploy Tayyorligi**

### **2.1. Docker Build Test**

#### **Backend Docker Image:**
```bash
cd backend

# Build
docker build -t vegas-backend:test .

# Test run
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="test-secret" \
  vegas-backend:test
```

#### **Frontend Docker Image:**
```bash
cd client

# Build
docker build -t vegas-frontend:test \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 \
  --build-arg NEXT_PUBLIC_WS_URL=http://localhost:5000 \
  --build-arg NEXTAUTH_SECRET=test-secret \
  .

# Test run
docker run -p 3000:3000 vegas-frontend:test
```

### **2.2. Docker Compose Test**

**To'liq tizimni ishga tushirish:**
```bash
# Root directory da
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f

# Statusni tekshirish
docker-compose ps

# Health check
curl http://localhost:5000/health
curl http://localhost:3000

# To'xtatish
docker-compose down
```

### **2.3. Production Deploy Checklist**

**✅ Tekshirish ro'yxati:**

- [ ] Environment variables to'g'ri sozlangan
- [ ] Database migration bajarilgan
- [ ] SSL sertifikatlari o'rnatilgan
- [ ] Firewall sozlangan (faqat 80, 443 portlar ochiq)
- [ ] Backup strategiyasi mavjud
- [ ] Monitoring sozlangan (Sentry)
- [ ] Logging sozlangan (Winston)
- [ ] Health check endpointlari ishlayapti
- [ ] Rate limiting yoqilgan
- [ ] CORS to'g'ri sozlangan

**Production Environment Variables:**
```bash
# Backend
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=super-secure-secret-min-32-chars
SENTRY_DSN=https://...

# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=super-secure-secret-min-32-chars
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 🧪 **3. JEST TESTING - Frontend & Backend**

### **3.1. Frontend Tests**

#### **Test Run:**
```bash
cd client

# Barcha testlar
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

#### **Yangi Test Yozish:**

**Example: Product Service Test**
```typescript
// client/__tests__/lib/services/product.test.ts
import { productService } from '@/lib/services/product.service';

// Mock API client
jest.mock('@/lib/api/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Product Service', () => {
  it('should fetch all products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: '10000' },
      { id: 2, name: 'Product 2', price: '20000' },
    ];

    const { api } = require('@/lib/api/api-client');
    api.get.mockResolvedValue({ products: mockProducts, pagination: {} });

    const result = await productService.getAll();
    
    expect(result.products).toEqual(mockProducts);
    expect(api.get).toHaveBeenCalledWith('/products');
  });

  it('should create a product', async () => {
    const newProduct = {
      name: 'New Product',
      price: '15000',
      categoryId: 1,
      stock: '100',
      unit: 'dona',
    };

    const { api } = require('@/lib/api/api-client');
    api.post.mockResolvedValue({ id: 3, ...newProduct });

    const result = await productService.create(newProduct);
    
    expect(result.name).toBe('New Product');
    expect(api.post).toHaveBeenCalledWith('/products', newProduct);
  });
});
```

**Example: Component Test**
```typescript
// client/__tests__/components/orders/order-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard } from '@/components/orders/order-card';

const mockOrder = {
  id: 1,
  status: 'pending',
  totalAmount: '100000',
  paymentMethod: 'cash',
  items: [],
  createdAt: new Date().toISOString(),
};

describe('OrderCard', () => {
  it('should render order details', () => {
    const onViewDetails = jest.fn();
    
    render(
      <OrderCard 
        order={mockOrder} 
        onViewDetails={onViewDetails}
      />
    );
    
    expect(screen.getByText(/100,000/)).toBeInTheDocument();
    expect(screen.getByText(/Naqd/)).toBeInTheDocument();
  });

  it('should call onViewDetails when clicked', () => {
    const onViewDetails = jest.fn();
    
    render(
      <OrderCard 
        order={mockOrder} 
        onViewDetails={onViewDetails}
      />
    );
    
    const detailButton = screen.getByText(/Batafsil/);
    fireEvent.click(detailButton);
    
    expect(onViewDetails).toHaveBeenCalledWith(mockOrder);
  });
});
```

### **3.2. Backend Tests (Setup)**

#### **Backend Test Setup:**

**1. Install Dependencies:**
```bash
cd backend
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**2. Jest Config:**
```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
```

**3. Example Test:**
```typescript
// backend/src/__tests__/modules/product/service.test.ts
import { productService } from '@/modules/product/service';
import { db } from '@/db';

jest.mock('@/db');

describe('Product Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: '10000' },
        { id: 2, name: 'Product 2', price: '20000' },
      ];

      (db.query.products.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll({});
      
      expect(result).toEqual(mockProducts);
      expect(db.query.products.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: '15000',
        categoryId: 1,
        stock: '100',
        unit: 'dona',
      };

      const createdProduct = { id: 3, ...newProduct };
      
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdProduct]),
        }),
      });

      const result = await productService.create(newProduct);
      
      expect(result.name).toBe('New Product');
    });
  });
});
```

**4. API Endpoint Test:**
```typescript
// backend/src/__tests__/modules/product/routes.test.ts
import request from 'supertest';
import express from 'express';
import productRoutes from '@/modules/product/routes';

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes', () => {
  describe('GET /products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        price: '10000',
        categoryId: 1,
        stock: '100',
        unit: 'dona',
        barcode: '123456',
      };

      const response = await request(app)
        .post('/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Product');
    });

    it('should return 400 for invalid data', async () => {
      const invalidProduct = {
        name: '', // Invalid: empty name
      };

      await request(app)
        .post('/products')
        .send(invalidProduct)
        .expect(400);
    });
  });
});
```

**5. Run Tests:**
```bash
cd backend

# Add to package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}

# Run
pnpm test
```

---

## 📊 **4. FULL SYSTEM TEST**

### **4.1. Integration Test Script**

```bash
#!/bin/bash
# test-all.sh

echo "🧪 Starting Full System Test..."

# 1. Backend Tests
echo "📦 Testing Backend..."
cd backend
pnpm test || exit 1

# 2. Frontend Tests
echo "🎨 Testing Frontend..."
cd ../client
pnpm test || exit 1

# 3. Build Tests
echo "🏗️  Testing Builds..."
cd ../backend
pnpm build || exit 1

cd ../client
pnpm build || exit 1

# 4. Docker Tests
echo "🐳 Testing Docker..."
cd ..
docker-compose build || exit 1

# 5. Health Checks
echo "🏥 Testing Health Checks..."
docker-compose up -d
sleep 10

curl -f http://localhost:5000/health || exit 1
curl -f http://localhost:3000 || exit 1

docker-compose down

echo "✅ All tests passed!"
```

### **4.2. CI/CD Test**

**GitHub Actions da avtomatik test:**
```bash
# .github/workflows/ci.yml allaqachon mavjud
# Har bir push/PR da avtomatik ishga tushadi

# Manual trigger:
git push origin main
```

---

## 📈 **5. MONITORING DASHBOARD**

### **5.1. Sentry Dashboard**

**Ko'riladigan metrikalar:**
- ✅ Error rate (xatolar soni)
- ✅ Performance (sahifa yuklanish vaqti)
- ✅ User sessions (foydalanuvchi sessiyalari)
- ✅ Release tracking (versiya kuzatuvi)
- ✅ Source maps (kod joylashuvi)

### **5.2. Application Logs**

**Backend logs:**
```bash
# Development
tail -f backend/logs/combined.log

# Production (Docker)
docker-compose logs -f backend
```

**Frontend logs:**
```bash
# Development
# Browser console

# Production (Docker)
docker-compose logs -f frontend
```

---

## ✅ **6. PRODUCTION READINESS CHECKLIST**

### **Security:**
- [x] Environment variables (no hardcoded secrets)
- [x] Input sanitization (XSS, SQL injection)
- [x] Rate limiting
- [x] CORS configured
- [x] Helmet security headers
- [x] JWT authentication
- [x] HTTPS (production)

### **Performance:**
- [x] Database indexes
- [x] Query optimization
- [x] Bundle optimization
- [x] Image optimization
- [x] Caching strategy
- [x] Code splitting

### **Monitoring:**
- [x] Error tracking (Sentry)
- [x] Logging (Winston)
- [x] Health checks
- [x] Performance monitoring

### **Testing:**
- [x] Unit tests
- [x] Component tests
- [x] API tests (setup ready)
- [ ] Integration tests (optional)
- [ ] E2E tests (optional)

### **DevOps:**
- [x] Docker setup
- [x] docker-compose
- [x] CI/CD pipeline
- [x] Automated tests
- [x] Security scanning

---

## 🎯 **QUICK START COMMANDS**

```bash
# 1. Frontend tests
cd client && pnpm test

# 2. Backend tests (after setup)
cd backend && pnpm test

# 3. Docker build
docker-compose build

# 4. Docker run
docker-compose up -d

# 5. Health check
curl http://localhost:5000/health
curl http://localhost:3000

# 6. View logs
docker-compose logs -f

# 7. Stop
docker-compose down
```

---

**Yaratilgan:** 2025-12-02  
**Status:** ✅ **PRODUCTION-READY**









## 📊 **1. SENTRY MONITORING - Setup & Testing**

### **1.1. Sentry Account Yaratish**

1. **Sentry.io ga kirish:**
   ```
   https://sentry.io/signup/
   ```

2. **Yangi Project yaratish:**
   - Project nomi: `vegas-crm-frontend`
   - Platform: `Next.js`
   - DSN ni nusxalash

3. **Backend uchun ham:**
   - Project nomi: `vegas-crm-backend`
   - Platform: `Node.js`
   - DSN ni nusxalash

### **1.2. Environment Variables Sozlash**

**Frontend (`client/.env`):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
```

**Backend (`backend/.env`):**
```bash
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/789012
```

### **1.3. Sentry ni Tekshirish**

#### **Frontend Test:**

**Test 1: Manual Error**
```typescript
// client/app/test-sentry/page.tsx
'use client';

export default function TestSentry() {
  const throwError = () => {
    throw new Error("Frontend Sentry Test Error!");
  };

  return (
    <div className="p-8">
      <h1>Sentry Test</h1>
      <button 
        onClick={throwError}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Test Sentry Error
      </button>
    </div>
  );
}
```

**Test 2: API Error**
```bash
# Browser console da
fetch('/api/non-existent').catch(console.error)
```

#### **Backend Test:**

**Test Script yaratish:**
```typescript
// backend/src/test-sentry.ts
import * as Sentry from "@sentry/node";
import { initSentry } from "./config/sentry";

initSentry();

// Test error
try {
  throw new Error("Backend Sentry Test Error!");
} catch (error) {
  Sentry.captureException(error);
  console.log("✅ Error sent to Sentry!");
}

// Test message
Sentry.captureMessage("Backend Sentry Test Message", "info");

// Flush events
Sentry.close(2000).then(() => {
  console.log("✅ All events flushed to Sentry!");
  process.exit(0);
});
```

**Ishga tushirish:**
```bash
cd backend
npx tsx src/test-sentry.ts
```

### **1.4. Sentry Dashboard Tekshirish**

1. **https://sentry.io** ga kiring
2. **Issues** bo'limiga o'ting
3. Yangi xatolarni ko'ring:
   - Error message
   - Stack trace
   - User context
   - Browser/OS info
   - Performance metrics

---

## 🐳 **2. DOCKER - Backend Deploy Tayyorligi**

### **2.1. Docker Build Test**

#### **Backend Docker Image:**
```bash
cd backend

# Build
docker build -t vegas-backend:test .

# Test run
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="test-secret" \
  vegas-backend:test
```

#### **Frontend Docker Image:**
```bash
cd client

# Build
docker build -t vegas-frontend:test \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 \
  --build-arg NEXT_PUBLIC_WS_URL=http://localhost:5000 \
  --build-arg NEXTAUTH_SECRET=test-secret \
  .

# Test run
docker run -p 3000:3000 vegas-frontend:test
```

### **2.2. Docker Compose Test**

**To'liq tizimni ishga tushirish:**
```bash
# Root directory da
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f

# Statusni tekshirish
docker-compose ps

# Health check
curl http://localhost:5000/health
curl http://localhost:3000

# To'xtatish
docker-compose down
```

### **2.3. Production Deploy Checklist**

**✅ Tekshirish ro'yxati:**

- [ ] Environment variables to'g'ri sozlangan
- [ ] Database migration bajarilgan
- [ ] SSL sertifikatlari o'rnatilgan
- [ ] Firewall sozlangan (faqat 80, 443 portlar ochiq)
- [ ] Backup strategiyasi mavjud
- [ ] Monitoring sozlangan (Sentry)
- [ ] Logging sozlangan (Winston)
- [ ] Health check endpointlari ishlayapti
- [ ] Rate limiting yoqilgan
- [ ] CORS to'g'ri sozlangan

**Production Environment Variables:**
```bash
# Backend
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=super-secure-secret-min-32-chars
SENTRY_DSN=https://...

# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=super-secure-secret-min-32-chars
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 🧪 **3. JEST TESTING - Frontend & Backend**

### **3.1. Frontend Tests**

#### **Test Run:**
```bash
cd client

# Barcha testlar
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

#### **Yangi Test Yozish:**

**Example: Product Service Test**
```typescript
// client/__tests__/lib/services/product.test.ts
import { productService } from '@/lib/services/product.service';

// Mock API client
jest.mock('@/lib/api/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Product Service', () => {
  it('should fetch all products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: '10000' },
      { id: 2, name: 'Product 2', price: '20000' },
    ];

    const { api } = require('@/lib/api/api-client');
    api.get.mockResolvedValue({ products: mockProducts, pagination: {} });

    const result = await productService.getAll();
    
    expect(result.products).toEqual(mockProducts);
    expect(api.get).toHaveBeenCalledWith('/products');
  });

  it('should create a product', async () => {
    const newProduct = {
      name: 'New Product',
      price: '15000',
      categoryId: 1,
      stock: '100',
      unit: 'dona',
    };

    const { api } = require('@/lib/api/api-client');
    api.post.mockResolvedValue({ id: 3, ...newProduct });

    const result = await productService.create(newProduct);
    
    expect(result.name).toBe('New Product');
    expect(api.post).toHaveBeenCalledWith('/products', newProduct);
  });
});
```

**Example: Component Test**
```typescript
// client/__tests__/components/orders/order-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard } from '@/components/orders/order-card';

const mockOrder = {
  id: 1,
  status: 'pending',
  totalAmount: '100000',
  paymentMethod: 'cash',
  items: [],
  createdAt: new Date().toISOString(),
};

describe('OrderCard', () => {
  it('should render order details', () => {
    const onViewDetails = jest.fn();
    
    render(
      <OrderCard 
        order={mockOrder} 
        onViewDetails={onViewDetails}
      />
    );
    
    expect(screen.getByText(/100,000/)).toBeInTheDocument();
    expect(screen.getByText(/Naqd/)).toBeInTheDocument();
  });

  it('should call onViewDetails when clicked', () => {
    const onViewDetails = jest.fn();
    
    render(
      <OrderCard 
        order={mockOrder} 
        onViewDetails={onViewDetails}
      />
    );
    
    const detailButton = screen.getByText(/Batafsil/);
    fireEvent.click(detailButton);
    
    expect(onViewDetails).toHaveBeenCalledWith(mockOrder);
  });
});
```

### **3.2. Backend Tests (Setup)**

#### **Backend Test Setup:**

**1. Install Dependencies:**
```bash
cd backend
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**2. Jest Config:**
```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
```

**3. Example Test:**
```typescript
// backend/src/__tests__/modules/product/service.test.ts
import { productService } from '@/modules/product/service';
import { db } from '@/db';

jest.mock('@/db');

describe('Product Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: '10000' },
        { id: 2, name: 'Product 2', price: '20000' },
      ];

      (db.query.products.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll({});
      
      expect(result).toEqual(mockProducts);
      expect(db.query.products.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: '15000',
        categoryId: 1,
        stock: '100',
        unit: 'dona',
      };

      const createdProduct = { id: 3, ...newProduct };
      
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdProduct]),
        }),
      });

      const result = await productService.create(newProduct);
      
      expect(result.name).toBe('New Product');
    });
  });
});
```

**4. API Endpoint Test:**
```typescript
// backend/src/__tests__/modules/product/routes.test.ts
import request from 'supertest';
import express from 'express';
import productRoutes from '@/modules/product/routes';

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes', () => {
  describe('GET /products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        price: '10000',
        categoryId: 1,
        stock: '100',
        unit: 'dona',
        barcode: '123456',
      };

      const response = await request(app)
        .post('/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Product');
    });

    it('should return 400 for invalid data', async () => {
      const invalidProduct = {
        name: '', // Invalid: empty name
      };

      await request(app)
        .post('/products')
        .send(invalidProduct)
        .expect(400);
    });
  });
});
```

**5. Run Tests:**
```bash
cd backend

# Add to package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}

# Run
pnpm test
```

---

## 📊 **4. FULL SYSTEM TEST**

### **4.1. Integration Test Script**

```bash
#!/bin/bash
# test-all.sh

echo "🧪 Starting Full System Test..."

# 1. Backend Tests
echo "📦 Testing Backend..."
cd backend
pnpm test || exit 1

# 2. Frontend Tests
echo "🎨 Testing Frontend..."
cd ../client
pnpm test || exit 1

# 3. Build Tests
echo "🏗️  Testing Builds..."
cd ../backend
pnpm build || exit 1

cd ../client
pnpm build || exit 1

# 4. Docker Tests
echo "🐳 Testing Docker..."
cd ..
docker-compose build || exit 1

# 5. Health Checks
echo "🏥 Testing Health Checks..."
docker-compose up -d
sleep 10

curl -f http://localhost:5000/health || exit 1
curl -f http://localhost:3000 || exit 1

docker-compose down

echo "✅ All tests passed!"
```

### **4.2. CI/CD Test**

**GitHub Actions da avtomatik test:**
```bash
# .github/workflows/ci.yml allaqachon mavjud
# Har bir push/PR da avtomatik ishga tushadi

# Manual trigger:
git push origin main
```

---

## 📈 **5. MONITORING DASHBOARD**

### **5.1. Sentry Dashboard**

**Ko'riladigan metrikalar:**
- ✅ Error rate (xatolar soni)
- ✅ Performance (sahifa yuklanish vaqti)
- ✅ User sessions (foydalanuvchi sessiyalari)
- ✅ Release tracking (versiya kuzatuvi)
- ✅ Source maps (kod joylashuvi)

### **5.2. Application Logs**

**Backend logs:**
```bash
# Development
tail -f backend/logs/combined.log

# Production (Docker)
docker-compose logs -f backend
```

**Frontend logs:**
```bash
# Development
# Browser console

# Production (Docker)
docker-compose logs -f frontend
```

---

## ✅ **6. PRODUCTION READINESS CHECKLIST**

### **Security:**
- [x] Environment variables (no hardcoded secrets)
- [x] Input sanitization (XSS, SQL injection)
- [x] Rate limiting
- [x] CORS configured
- [x] Helmet security headers
- [x] JWT authentication
- [x] HTTPS (production)

### **Performance:**
- [x] Database indexes
- [x] Query optimization
- [x] Bundle optimization
- [x] Image optimization
- [x] Caching strategy
- [x] Code splitting

### **Monitoring:**
- [x] Error tracking (Sentry)
- [x] Logging (Winston)
- [x] Health checks
- [x] Performance monitoring

### **Testing:**
- [x] Unit tests
- [x] Component tests
- [x] API tests (setup ready)
- [ ] Integration tests (optional)
- [ ] E2E tests (optional)

### **DevOps:**
- [x] Docker setup
- [x] docker-compose
- [x] CI/CD pipeline
- [x] Automated tests
- [x] Security scanning

---

## 🎯 **QUICK START COMMANDS**

```bash
# 1. Frontend tests
cd client && pnpm test

# 2. Backend tests (after setup)
cd backend && pnpm test

# 3. Docker build
docker-compose build

# 4. Docker run
docker-compose up -d

# 5. Health check
curl http://localhost:5000/health
curl http://localhost:3000

# 6. View logs
docker-compose logs -f

# 7. Stop
docker-compose down
```

---

**Yaratilgan:** 2025-12-02  
**Status:** ✅ **PRODUCTION-READY**








## 📊 **1. SENTRY MONITORING - Setup & Testing**

### **1.1. Sentry Account Yaratish**

1. **Sentry.io ga kirish:**
   ```
   https://sentry.io/signup/
   ```

2. **Yangi Project yaratish:**
   - Project nomi: `vegas-crm-frontend`
   - Platform: `Next.js`
   - DSN ni nusxalash

3. **Backend uchun ham:**
   - Project nomi: `vegas-crm-backend`
   - Platform: `Node.js`
   - DSN ni nusxalash

### **1.2. Environment Variables Sozlash**

**Frontend (`client/.env`):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
```

**Backend (`backend/.env`):**
```bash
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/789012
```

### **1.3. Sentry ni Tekshirish**

#### **Frontend Test:**

**Test 1: Manual Error**
```typescript
// client/app/test-sentry/page.tsx
'use client';

export default function TestSentry() {
  const throwError = () => {
    throw new Error("Frontend Sentry Test Error!");
  };

  return (
    <div className="p-8">
      <h1>Sentry Test</h1>
      <button 
        onClick={throwError}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Test Sentry Error
      </button>
    </div>
  );
}
```

**Test 2: API Error**
```bash
# Browser console da
fetch('/api/non-existent').catch(console.error)
```

#### **Backend Test:**

**Test Script yaratish:**
```typescript
// backend/src/test-sentry.ts
import * as Sentry from "@sentry/node";
import { initSentry } from "./config/sentry";

initSentry();

// Test error
try {
  throw new Error("Backend Sentry Test Error!");
} catch (error) {
  Sentry.captureException(error);
  console.log("✅ Error sent to Sentry!");
}

// Test message
Sentry.captureMessage("Backend Sentry Test Message", "info");

// Flush events
Sentry.close(2000).then(() => {
  console.log("✅ All events flushed to Sentry!");
  process.exit(0);
});
```

**Ishga tushirish:**
```bash
cd backend
npx tsx src/test-sentry.ts
```

### **1.4. Sentry Dashboard Tekshirish**

1. **https://sentry.io** ga kiring
2. **Issues** bo'limiga o'ting
3. Yangi xatolarni ko'ring:
   - Error message
   - Stack trace
   - User context
   - Browser/OS info
   - Performance metrics

---

## 🐳 **2. DOCKER - Backend Deploy Tayyorligi**

### **2.1. Docker Build Test**

#### **Backend Docker Image:**
```bash
cd backend

# Build
docker build -t vegas-backend:test .

# Test run
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="test-secret" \
  vegas-backend:test
```

#### **Frontend Docker Image:**
```bash
cd client

# Build
docker build -t vegas-frontend:test \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 \
  --build-arg NEXT_PUBLIC_WS_URL=http://localhost:5000 \
  --build-arg NEXTAUTH_SECRET=test-secret \
  .

# Test run
docker run -p 3000:3000 vegas-frontend:test
```

### **2.2. Docker Compose Test**

**To'liq tizimni ishga tushirish:**
```bash
# Root directory da
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f

# Statusni tekshirish
docker-compose ps

# Health check
curl http://localhost:5000/health
curl http://localhost:3000

# To'xtatish
docker-compose down
```

### **2.3. Production Deploy Checklist**

**✅ Tekshirish ro'yxati:**

- [ ] Environment variables to'g'ri sozlangan
- [ ] Database migration bajarilgan
- [ ] SSL sertifikatlari o'rnatilgan
- [ ] Firewall sozlangan (faqat 80, 443 portlar ochiq)
- [ ] Backup strategiyasi mavjud
- [ ] Monitoring sozlangan (Sentry)
- [ ] Logging sozlangan (Winston)
- [ ] Health check endpointlari ishlayapti
- [ ] Rate limiting yoqilgan
- [ ] CORS to'g'ri sozlangan

**Production Environment Variables:**
```bash
# Backend
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=super-secure-secret-min-32-chars
SENTRY_DSN=https://...

# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=super-secure-secret-min-32-chars
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 🧪 **3. JEST TESTING - Frontend & Backend**

### **3.1. Frontend Tests**

#### **Test Run:**
```bash
cd client

# Barcha testlar
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

#### **Yangi Test Yozish:**

**Example: Product Service Test**
```typescript
// client/__tests__/lib/services/product.test.ts
import { productService } from '@/lib/services/product.service';

// Mock API client
jest.mock('@/lib/api/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Product Service', () => {
  it('should fetch all products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: '10000' },
      { id: 2, name: 'Product 2', price: '20000' },
    ];

    const { api } = require('@/lib/api/api-client');
    api.get.mockResolvedValue({ products: mockProducts, pagination: {} });

    const result = await productService.getAll();
    
    expect(result.products).toEqual(mockProducts);
    expect(api.get).toHaveBeenCalledWith('/products');
  });

  it('should create a product', async () => {
    const newProduct = {
      name: 'New Product',
      price: '15000',
      categoryId: 1,
      stock: '100',
      unit: 'dona',
    };

    const { api } = require('@/lib/api/api-client');
    api.post.mockResolvedValue({ id: 3, ...newProduct });

    const result = await productService.create(newProduct);
    
    expect(result.name).toBe('New Product');
    expect(api.post).toHaveBeenCalledWith('/products', newProduct);
  });
});
```

**Example: Component Test**
```typescript
// client/__tests__/components/orders/order-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard } from '@/components/orders/order-card';

const mockOrder = {
  id: 1,
  status: 'pending',
  totalAmount: '100000',
  paymentMethod: 'cash',
  items: [],
  createdAt: new Date().toISOString(),
};

describe('OrderCard', () => {
  it('should render order details', () => {
    const onViewDetails = jest.fn();
    
    render(
      <OrderCard 
        order={mockOrder} 
        onViewDetails={onViewDetails}
      />
    );
    
    expect(screen.getByText(/100,000/)).toBeInTheDocument();
    expect(screen.getByText(/Naqd/)).toBeInTheDocument();
  });

  it('should call onViewDetails when clicked', () => {
    const onViewDetails = jest.fn();
    
    render(
      <OrderCard 
        order={mockOrder} 
        onViewDetails={onViewDetails}
      />
    );
    
    const detailButton = screen.getByText(/Batafsil/);
    fireEvent.click(detailButton);
    
    expect(onViewDetails).toHaveBeenCalledWith(mockOrder);
  });
});
```

### **3.2. Backend Tests (Setup)**

#### **Backend Test Setup:**

**1. Install Dependencies:**
```bash
cd backend
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**2. Jest Config:**
```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
```

**3. Example Test:**
```typescript
// backend/src/__tests__/modules/product/service.test.ts
import { productService } from '@/modules/product/service';
import { db } from '@/db';

jest.mock('@/db');

describe('Product Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: '10000' },
        { id: 2, name: 'Product 2', price: '20000' },
      ];

      (db.query.products.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll({});
      
      expect(result).toEqual(mockProducts);
      expect(db.query.products.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: '15000',
        categoryId: 1,
        stock: '100',
        unit: 'dona',
      };

      const createdProduct = { id: 3, ...newProduct };
      
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdProduct]),
        }),
      });

      const result = await productService.create(newProduct);
      
      expect(result.name).toBe('New Product');
    });
  });
});
```

**4. API Endpoint Test:**
```typescript
// backend/src/__tests__/modules/product/routes.test.ts
import request from 'supertest';
import express from 'express';
import productRoutes from '@/modules/product/routes';

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes', () => {
  describe('GET /products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        price: '10000',
        categoryId: 1,
        stock: '100',
        unit: 'dona',
        barcode: '123456',
      };

      const response = await request(app)
        .post('/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Product');
    });

    it('should return 400 for invalid data', async () => {
      const invalidProduct = {
        name: '', // Invalid: empty name
      };

      await request(app)
        .post('/products')
        .send(invalidProduct)
        .expect(400);
    });
  });
});
```

**5. Run Tests:**
```bash
cd backend

# Add to package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}

# Run
pnpm test
```

---

## 📊 **4. FULL SYSTEM TEST**

### **4.1. Integration Test Script**

```bash
#!/bin/bash
# test-all.sh

echo "🧪 Starting Full System Test..."

# 1. Backend Tests
echo "📦 Testing Backend..."
cd backend
pnpm test || exit 1

# 2. Frontend Tests
echo "🎨 Testing Frontend..."
cd ../client
pnpm test || exit 1

# 3. Build Tests
echo "🏗️  Testing Builds..."
cd ../backend
pnpm build || exit 1

cd ../client
pnpm build || exit 1

# 4. Docker Tests
echo "🐳 Testing Docker..."
cd ..
docker-compose build || exit 1

# 5. Health Checks
echo "🏥 Testing Health Checks..."
docker-compose up -d
sleep 10

curl -f http://localhost:5000/health || exit 1
curl -f http://localhost:3000 || exit 1

docker-compose down

echo "✅ All tests passed!"
```

### **4.2. CI/CD Test**

**GitHub Actions da avtomatik test:**
```bash
# .github/workflows/ci.yml allaqachon mavjud
# Har bir push/PR da avtomatik ishga tushadi

# Manual trigger:
git push origin main
```

---

## 📈 **5. MONITORING DASHBOARD**

### **5.1. Sentry Dashboard**

**Ko'riladigan metrikalar:**
- ✅ Error rate (xatolar soni)
- ✅ Performance (sahifa yuklanish vaqti)
- ✅ User sessions (foydalanuvchi sessiyalari)
- ✅ Release tracking (versiya kuzatuvi)
- ✅ Source maps (kod joylashuvi)

### **5.2. Application Logs**

**Backend logs:**
```bash
# Development
tail -f backend/logs/combined.log

# Production (Docker)
docker-compose logs -f backend
```

**Frontend logs:**
```bash
# Development
# Browser console

# Production (Docker)
docker-compose logs -f frontend
```

---

## ✅ **6. PRODUCTION READINESS CHECKLIST**

### **Security:**
- [x] Environment variables (no hardcoded secrets)
- [x] Input sanitization (XSS, SQL injection)
- [x] Rate limiting
- [x] CORS configured
- [x] Helmet security headers
- [x] JWT authentication
- [x] HTTPS (production)

### **Performance:**
- [x] Database indexes
- [x] Query optimization
- [x] Bundle optimization
- [x] Image optimization
- [x] Caching strategy
- [x] Code splitting

### **Monitoring:**
- [x] Error tracking (Sentry)
- [x] Logging (Winston)
- [x] Health checks
- [x] Performance monitoring

### **Testing:**
- [x] Unit tests
- [x] Component tests
- [x] API tests (setup ready)
- [ ] Integration tests (optional)
- [ ] E2E tests (optional)

### **DevOps:**
- [x] Docker setup
- [x] docker-compose
- [x] CI/CD pipeline
- [x] Automated tests
- [x] Security scanning

---

## 🎯 **QUICK START COMMANDS**

```bash
# 1. Frontend tests
cd client && pnpm test

# 2. Backend tests (after setup)
cd backend && pnpm test

# 3. Docker build
docker-compose build

# 4. Docker run
docker-compose up -d

# 5. Health check
curl http://localhost:5000/health
curl http://localhost:3000

# 6. View logs
docker-compose logs -f

# 7. Stop
docker-compose down
```

---

**Yaratilgan:** 2025-12-02  
**Status:** ✅ **PRODUCTION-READY**










