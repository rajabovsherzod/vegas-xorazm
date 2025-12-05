# 🔐 ENVIRONMENT VARIABLES

## **Frontend (client/.env)**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# GlitchTip Configuration (Optional - for monitoring)
# Get DSN from: http://localhost:8000 → Project → Settings → Client Keys
NEXT_PUBLIC_GLITCHTIP_DSN=http://your-key@localhost:8000/1
```

---

## **Backend (backend/.env)**

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vegas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# GlitchTip Configuration (Optional - for monitoring)
# Get DSN from: http://localhost:8000 → Project → Settings → Client Keys
GLITCHTIP_DSN=http://your-key@localhost:8000/2
```

---

## **GlitchTip (docker-compose.monitoring.yml)**

```bash
# GlitchTip Configuration
# Copy to .env.glitchtip.local and customize

# Database
GLITCHTIP_DB_PASSWORD=glitchtip_super_secret_password_change_this

# Secret Key (min 50 characters)
GLITCHTIP_SECRET_KEY=your-super-secret-key-min-50-chars-change-this-to-random-string

# Domain (production)
GLITCHTIP_DOMAIN=http://localhost:8000

# Email (optional)
# SMTP example:
# GLITCHTIP_EMAIL_URL=smtp://user:password@smtp.gmail.com:587/?tls=True
# Console (development):
GLITCHTIP_EMAIL_URL=consolemail://

# From Email
GLITCHTIP_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📝 **ESLATMA:**

### **SENTRY O'CHIRILDI! ✅**

Endi `SENTRY_DSN` o'rniga `GLITCHTIP_DSN` ishlatiladi:

**Eski (o'chirildi):**
```bash
NEXT_PUBLIC_SENTRY_DSN=...  ❌
SENTRY_DSN=...              ❌
```

**Yangi (hozir):**
```bash
NEXT_PUBLIC_GLITCHTIP_DSN=...  ✅
GLITCHTIP_DSN=...              ✅
```

---

## 🚀 **QUICK START:**

1. **Frontend .env yaratish:**
```bash
cd client
cp .env.example .env
# .env ni tahrirlang
```

2. **Backend .env yaratish:**
```bash
cd backend
cp .env.example .env
# .env ni tahrirlang
```

3. **GlitchTip sozlash (optional):**
```bash
./scripts/setup-glitchtip.sh
# DSN ni oling va .env ga qo'shing
```

---

## ✅ **PRODUCTION CHECKLIST:**

- [ ] Barcha `your-secret` larni o'zgartiring
- [ ] JWT_SECRET kamida 32 belgi
- [ ] NEXTAUTH_SECRET kamida 32 belgi
- [ ] DATABASE_URL production database
- [ ] GLITCHTIP_DSN sozlangan (optional)
- [ ] NODE_ENV=production
- [ ] CORS whitelist sozlangan

---

**Yaratilgan:** 2025-12-02  
**Status:** ✅ **UPDATED**








## **Frontend (client/.env)**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# GlitchTip Configuration (Optional - for monitoring)
# Get DSN from: http://localhost:8000 → Project → Settings → Client Keys
NEXT_PUBLIC_GLITCHTIP_DSN=http://your-key@localhost:8000/1
```

---

## **Backend (backend/.env)**

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vegas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# GlitchTip Configuration (Optional - for monitoring)
# Get DSN from: http://localhost:8000 → Project → Settings → Client Keys
GLITCHTIP_DSN=http://your-key@localhost:8000/2
```

---

## **GlitchTip (docker-compose.monitoring.yml)**

```bash
# GlitchTip Configuration
# Copy to .env.glitchtip.local and customize

# Database
GLITCHTIP_DB_PASSWORD=glitchtip_super_secret_password_change_this

# Secret Key (min 50 characters)
GLITCHTIP_SECRET_KEY=your-super-secret-key-min-50-chars-change-this-to-random-string

# Domain (production)
GLITCHTIP_DOMAIN=http://localhost:8000

# Email (optional)
# SMTP example:
# GLITCHTIP_EMAIL_URL=smtp://user:password@smtp.gmail.com:587/?tls=True
# Console (development):
GLITCHTIP_EMAIL_URL=consolemail://

# From Email
GLITCHTIP_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📝 **ESLATMA:**

### **SENTRY O'CHIRILDI! ✅**

Endi `SENTRY_DSN` o'rniga `GLITCHTIP_DSN` ishlatiladi:

**Eski (o'chirildi):**
```bash
NEXT_PUBLIC_SENTRY_DSN=...  ❌
SENTRY_DSN=...              ❌
```

**Yangi (hozir):**
```bash
NEXT_PUBLIC_GLITCHTIP_DSN=...  ✅
GLITCHTIP_DSN=...              ✅
```

---

## 🚀 **QUICK START:**

1. **Frontend .env yaratish:**
```bash
cd client
cp .env.example .env
# .env ni tahrirlang
```

2. **Backend .env yaratish:**
```bash
cd backend
cp .env.example .env
# .env ni tahrirlang
```

3. **GlitchTip sozlash (optional):**
```bash
./scripts/setup-glitchtip.sh
# DSN ni oling va .env ga qo'shing
```

---

## ✅ **PRODUCTION CHECKLIST:**

- [ ] Barcha `your-secret` larni o'zgartiring
- [ ] JWT_SECRET kamida 32 belgi
- [ ] NEXTAUTH_SECRET kamida 32 belgi
- [ ] DATABASE_URL production database
- [ ] GLITCHTIP_DSN sozlangan (optional)
- [ ] NODE_ENV=production
- [ ] CORS whitelist sozlangan

---

**Yaratilgan:** 2025-12-02  
**Status:** ✅ **UPDATED**









## **Frontend (client/.env)**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# GlitchTip Configuration (Optional - for monitoring)
# Get DSN from: http://localhost:8000 → Project → Settings → Client Keys
NEXT_PUBLIC_GLITCHTIP_DSN=http://your-key@localhost:8000/1
```

---

## **Backend (backend/.env)**

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vegas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# GlitchTip Configuration (Optional - for monitoring)
# Get DSN from: http://localhost:8000 → Project → Settings → Client Keys
GLITCHTIP_DSN=http://your-key@localhost:8000/2
```

---

## **GlitchTip (docker-compose.monitoring.yml)**

```bash
# GlitchTip Configuration
# Copy to .env.glitchtip.local and customize

# Database
GLITCHTIP_DB_PASSWORD=glitchtip_super_secret_password_change_this

# Secret Key (min 50 characters)
GLITCHTIP_SECRET_KEY=your-super-secret-key-min-50-chars-change-this-to-random-string

# Domain (production)
GLITCHTIP_DOMAIN=http://localhost:8000

# Email (optional)
# SMTP example:
# GLITCHTIP_EMAIL_URL=smtp://user:password@smtp.gmail.com:587/?tls=True
# Console (development):
GLITCHTIP_EMAIL_URL=consolemail://

# From Email
GLITCHTIP_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📝 **ESLATMA:**

### **SENTRY O'CHIRILDI! ✅**

Endi `SENTRY_DSN` o'rniga `GLITCHTIP_DSN` ishlatiladi:

**Eski (o'chirildi):**
```bash
NEXT_PUBLIC_SENTRY_DSN=...  ❌
SENTRY_DSN=...              ❌
```

**Yangi (hozir):**
```bash
NEXT_PUBLIC_GLITCHTIP_DSN=...  ✅
GLITCHTIP_DSN=...              ✅
```

---

## 🚀 **QUICK START:**

1. **Frontend .env yaratish:**
```bash
cd client
cp .env.example .env
# .env ni tahrirlang
```

2. **Backend .env yaratish:**
```bash
cd backend
cp .env.example .env
# .env ni tahrirlang
```

3. **GlitchTip sozlash (optional):**
```bash
./scripts/setup-glitchtip.sh
# DSN ni oling va .env ga qo'shing
```

---

## ✅ **PRODUCTION CHECKLIST:**

- [ ] Barcha `your-secret` larni o'zgartiring
- [ ] JWT_SECRET kamida 32 belgi
- [ ] NEXTAUTH_SECRET kamida 32 belgi
- [ ] DATABASE_URL production database
- [ ] GLITCHTIP_DSN sozlangan (optional)
- [ ] NODE_ENV=production
- [ ] CORS whitelist sozlangan

---

**Yaratilgan:** 2025-12-02  
**Status:** ✅ **UPDATED**








## **Frontend (client/.env)**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# GlitchTip Configuration (Optional - for monitoring)
# Get DSN from: http://localhost:8000 → Project → Settings → Client Keys
NEXT_PUBLIC_GLITCHTIP_DSN=http://your-key@localhost:8000/1
```

---

## **Backend (backend/.env)**

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vegas

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# GlitchTip Configuration (Optional - for monitoring)
# Get DSN from: http://localhost:8000 → Project → Settings → Client Keys
GLITCHTIP_DSN=http://your-key@localhost:8000/2
```

---

## **GlitchTip (docker-compose.monitoring.yml)**

```bash
# GlitchTip Configuration
# Copy to .env.glitchtip.local and customize

# Database
GLITCHTIP_DB_PASSWORD=glitchtip_super_secret_password_change_this

# Secret Key (min 50 characters)
GLITCHTIP_SECRET_KEY=your-super-secret-key-min-50-chars-change-this-to-random-string

# Domain (production)
GLITCHTIP_DOMAIN=http://localhost:8000

# Email (optional)
# SMTP example:
# GLITCHTIP_EMAIL_URL=smtp://user:password@smtp.gmail.com:587/?tls=True
# Console (development):
GLITCHTIP_EMAIL_URL=consolemail://

# From Email
GLITCHTIP_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📝 **ESLATMA:**

### **SENTRY O'CHIRILDI! ✅**

Endi `SENTRY_DSN` o'rniga `GLITCHTIP_DSN` ishlatiladi:

**Eski (o'chirildi):**
```bash
NEXT_PUBLIC_SENTRY_DSN=...  ❌
SENTRY_DSN=...              ❌
```

**Yangi (hozir):**
```bash
NEXT_PUBLIC_GLITCHTIP_DSN=...  ✅
GLITCHTIP_DSN=...              ✅
```

---

## 🚀 **QUICK START:**

1. **Frontend .env yaratish:**
```bash
cd client
cp .env.example .env
# .env ni tahrirlang
```

2. **Backend .env yaratish:**
```bash
cd backend
cp .env.example .env
# .env ni tahrirlang
```

3. **GlitchTip sozlash (optional):**
```bash
./scripts/setup-glitchtip.sh
# DSN ni oling va .env ga qo'shing
```

---

## ✅ **PRODUCTION CHECKLIST:**

- [ ] Barcha `your-secret` larni o'zgartiring
- [ ] JWT_SECRET kamida 32 belgi
- [ ] NEXTAUTH_SECRET kamida 32 belgi
- [ ] DATABASE_URL production database
- [ ] GLITCHTIP_DSN sozlangan (optional)
- [ ] NODE_ENV=production
- [ ] CORS whitelist sozlangan

---

**Yaratilgan:** 2025-12-02  
**Status:** ✅ **UPDATED**









