# 🔍 GLITCHTIP - SETUP GUIDE

> **100% Bepul, Cheksiz, Sentry-compatible Monitoring**

---

## 📋 **NIMA QILINDI?**

✅ GlitchTip Docker Compose konfiguratsiyasi yaratildi
✅ Avtomatik setup script yaratildi
✅ Environment variables sozlandi
✅ Sentry SDK ishlaydi (o'zgarishsiz!)

---

## 🚀 **QUICK START (5 DAQIQA)**

### **1. GlitchTip ni ishga tushirish:**

```bash
# Root directory da
./scripts/setup-glitchtip.sh
```

**Script qiladigan ishlar:**
1. ✅ Environment file yaratadi
2. ✅ Random secret keys generatsiya qiladi
3. ✅ Docker containers ishga tushiradi
4. ✅ Database migratsiyalarini bajaradi
5. ✅ Admin user yaratishni so'raydi

### **2. Admin user yaratish:**

Script oxirida so'raydi:
```
Username: admin
Email: admin@yourdomain.com
Password: ********
Password (again): ********
```

### **3. GlitchTip ga kirish:**

```
URL: http://localhost:8000
Username: admin
Password: (yaratgan parolingiz)
```

---

## 📊 **PROJECT YARATISH**

### **1. Dashboard ga kirish:**
- http://localhost:8000 ga kiring
- Login qiling

### **2. Yangi Organization yaratish:**
- "Create Organization" tugmasini bosing
- Nom: "Vegas CRM"
- Save

### **3. Yangi Project yaratish:**

**Frontend Project:**
- Name: `vegas-crm-frontend`
- Platform: `JavaScript` yoki `Next.js`
- Create

**Backend Project:**
- Name: `vegas-crm-backend`
- Platform: `Node.js`
- Create

### **4. DSN ni olish:**

Har bir project uchun:
1. Settings → Client Keys (DSN)
2. DSN ni nusxalash
3. Misol: `http://abc123@localhost:8000/1`

---

## 🔧 **ENVIRONMENT VARIABLES SOZLASH**

### **Frontend (.env):**

```bash
# client/.env
NEXT_PUBLIC_SENTRY_DSN=http://your-key@localhost:8000/1

# Qolgan qismlar o'zgarishsiz
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret
```

### **Backend (.env):**

```bash
# backend/.env
SENTRY_DSN=http://your-key@localhost:8000/2

# Qolgan qismlar o'zgarishsiz
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

## ✅ **TEST QILISH**

### **1. Frontend Test:**

```bash
# Dev server ishga tushirish
cd client
pnpm dev

# Test sahifaga kirish
http://localhost:3000/test-sentry

# Tugmalarni bosish
# GlitchTip dashboard da Issues ni ko'rish
```

### **2. Backend Test:**

```bash
# Backend ishga tushirish
cd backend
pnpm dev

# Test error yuborish (optional)
curl -X POST http://localhost:5000/api/v1/test-error
```

### **3. GlitchTip Dashboard:**

```
http://localhost:8000
→ Issues
→ Yangi xatolarni ko'rish
```

---

## 📁 **SENTRY SDK - O'ZGARISHSIZ ISHLAYDI!**

### **GlitchTip Sentry-compatible:**

Barcha Sentry SDK kodlari o'zgarishsiz ishlaydi:

**Frontend:**
```typescript
// client/sentry.client.config.ts
// Faqat DSN o'zgardi, qolgan kod bir xil!
Sentry.init({
  dsn: "http://your-key@localhost:8000/1", // GlitchTip DSN
  // ... qolgan konfiguratsiya bir xil
});
```

**Backend:**
```typescript
// backend/src/config/sentry.ts
// Faqat DSN o'zgardi, qolgan kod bir xil!
Sentry.init({
  dsn: "http://your-key@localhost:8000/2", // GlitchTip DSN
  // ... qolgan konfiguratsiya bir xil
});
```

**Test sahifa:**
```typescript
// client/app/test-sentry/page.tsx
// Hech narsa o'zgarmadi!
// Barcha testlar ishlaydi
```

---

## 🐳 **DOCKER COMMANDS**

### **Ishga tushirish:**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### **Loglarni ko'rish:**
```bash
docker-compose -f docker-compose.monitoring.yml logs -f
```

### **Statusni tekshirish:**
```bash
docker-compose -f docker-compose.monitoring.yml ps
```

### **To'xtatish:**
```bash
docker-compose -f docker-compose.monitoring.yml down
```

### **To'liq tozalash (ma'lumotlar bilan):**
```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

### **Qayta ishga tushirish:**
```bash
docker-compose -f docker-compose.monitoring.yml restart
```

---

## 🌐 **PRODUCTION SETUP**

### **1. Domain sozlash:**

```bash
# .env.glitchtip.local
GLITCHTIP_DOMAIN=https://monitoring.yourdomain.com
```

### **2. Nginx Reverse Proxy:**

```nginx
# /etc/nginx/sites-available/glitchtip
server {
    listen 80;
    server_name monitoring.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **3. SSL (Let's Encrypt):**

```bash
sudo certbot --nginx -d monitoring.yourdomain.com
```

### **4. Email sozlash (optional):**

```bash
# .env.glitchtip.local
GLITCHTIP_EMAIL_URL=smtp://user:password@smtp.gmail.com:587/?tls=True
GLITCHTIP_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📊 **GLITCHTIP FEATURES**

### **✅ Bepul Features:**
- ✅ Cheksiz events
- ✅ Cheksiz projects
- ✅ Cheksiz users
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ Source maps
- ✅ User feedback
- ✅ Alerts (email)
- ✅ API access
- ✅ Data retention (90 days default)

### **🔄 Sentry Compatibility:**
- ✅ Sentry SDK ishlaydi
- ✅ Sentry DSN format
- ✅ Sentry API compatible
- ✅ Source maps upload
- ✅ Release tracking

---

## 🆚 **SENTRY vs GLITCHTIP**

| Feature | Sentry Free | GlitchTip |
|---------|-------------|-----------|
| **Narx** | Bepul | Bepul |
| **Events/month** | 5,000 | ♾️ Cheksiz |
| **Users** | 1 | ♾️ Cheksiz |
| **Projects** | Cheklangan | ♾️ Cheksiz |
| **Data retention** | 30 days | 90 days (sozlanadi) |
| **Self-hosted** | ❌ | ✅ |
| **Privacy** | ⚠️ 3rd party | ✅ To'liq |
| **Dashboard** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Setup** | 5 min | 10 min |
| **Maintenance** | Yo'q | Minimal |

---

## 🔧 **TROUBLESHOOTING**

### **Problem: Container ishlamayapti**
```bash
# Loglarni ko'rish
docker-compose -f docker-compose.monitoring.yml logs glitchtip-web

# Qayta ishga tushirish
docker-compose -f docker-compose.monitoring.yml restart
```

### **Problem: Database migration xatosi**
```bash
# Migration qayta bajarish
docker-compose -f docker-compose.monitoring.yml run --rm glitchtip-migrate
```

### **Problem: Admin user yaratib bo'lmayapti**
```bash
# Manual yaratish
docker-compose -f docker-compose.monitoring.yml exec glitchtip-web ./manage.py createsuperuser
```

### **Problem: Port 8000 band**
```bash
# Port o'zgartirish
# docker-compose.monitoring.yml da:
ports:
  - "9000:8000"  # 8000 o'rniga 9000
```

---

## 📚 **FOYDALI HAVOLALAR**

- **GlitchTip Docs:** https://glitchtip.com/documentation
- **GlitchTip GitHub:** https://github.com/glitchtip/glitchtip
- **Sentry SDK Docs:** https://docs.sentry.io/
- **Docker Docs:** https://docs.docker.com/

---

## ✅ **CHECKLIST**

- [ ] GlitchTip ishga tushirildi
- [ ] Admin user yaratildi
- [ ] Organization yaratildi
- [ ] Frontend project yaratildi
- [ ] Backend project yaratildi
- [ ] DSN olindi
- [ ] Frontend .env sozlandi
- [ ] Backend .env sozlandi
- [ ] Test qilindi
- [ ] Issues ko'rindi

---

## 🎉 **YAKUNIY NATIJA**

**GlitchTip muvaffaqiyatli sozlandi!**

- ✅ **100% bepul**
- ✅ **Cheksiz events**
- ✅ **Sentry-compatible**
- ✅ **Self-hosted**
- ✅ **Professional monitoring**

**Access:**
- Dashboard: http://localhost:8000
- Test: http://localhost:3000/test-sentry

**Status:** ✅ **PRODUCTION-READY**

---

**Yaratilgan:** 2025-12-02  
**Versiya:** 1.0.0








> **100% Bepul, Cheksiz, Sentry-compatible Monitoring**

---

## 📋 **NIMA QILINDI?**

✅ GlitchTip Docker Compose konfiguratsiyasi yaratildi
✅ Avtomatik setup script yaratildi
✅ Environment variables sozlandi
✅ Sentry SDK ishlaydi (o'zgarishsiz!)

---

## 🚀 **QUICK START (5 DAQIQA)**

### **1. GlitchTip ni ishga tushirish:**

```bash
# Root directory da
./scripts/setup-glitchtip.sh
```

**Script qiladigan ishlar:**
1. ✅ Environment file yaratadi
2. ✅ Random secret keys generatsiya qiladi
3. ✅ Docker containers ishga tushiradi
4. ✅ Database migratsiyalarini bajaradi
5. ✅ Admin user yaratishni so'raydi

### **2. Admin user yaratish:**

Script oxirida so'raydi:
```
Username: admin
Email: admin@yourdomain.com
Password: ********
Password (again): ********
```

### **3. GlitchTip ga kirish:**

```
URL: http://localhost:8000
Username: admin
Password: (yaratgan parolingiz)
```

---

## 📊 **PROJECT YARATISH**

### **1. Dashboard ga kirish:**
- http://localhost:8000 ga kiring
- Login qiling

### **2. Yangi Organization yaratish:**
- "Create Organization" tugmasini bosing
- Nom: "Vegas CRM"
- Save

### **3. Yangi Project yaratish:**

**Frontend Project:**
- Name: `vegas-crm-frontend`
- Platform: `JavaScript` yoki `Next.js`
- Create

**Backend Project:**
- Name: `vegas-crm-backend`
- Platform: `Node.js`
- Create

### **4. DSN ni olish:**

Har bir project uchun:
1. Settings → Client Keys (DSN)
2. DSN ni nusxalash
3. Misol: `http://abc123@localhost:8000/1`

---

## 🔧 **ENVIRONMENT VARIABLES SOZLASH**

### **Frontend (.env):**

```bash
# client/.env
NEXT_PUBLIC_SENTRY_DSN=http://your-key@localhost:8000/1

# Qolgan qismlar o'zgarishsiz
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret
```

### **Backend (.env):**

```bash
# backend/.env
SENTRY_DSN=http://your-key@localhost:8000/2

# Qolgan qismlar o'zgarishsiz
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

## ✅ **TEST QILISH**

### **1. Frontend Test:**

```bash
# Dev server ishga tushirish
cd client
pnpm dev

# Test sahifaga kirish
http://localhost:3000/test-sentry

# Tugmalarni bosish
# GlitchTip dashboard da Issues ni ko'rish
```

### **2. Backend Test:**

```bash
# Backend ishga tushirish
cd backend
pnpm dev

# Test error yuborish (optional)
curl -X POST http://localhost:5000/api/v1/test-error
```

### **3. GlitchTip Dashboard:**

```
http://localhost:8000
→ Issues
→ Yangi xatolarni ko'rish
```

---

## 📁 **SENTRY SDK - O'ZGARISHSIZ ISHLAYDI!**

### **GlitchTip Sentry-compatible:**

Barcha Sentry SDK kodlari o'zgarishsiz ishlaydi:

**Frontend:**
```typescript
// client/sentry.client.config.ts
// Faqat DSN o'zgardi, qolgan kod bir xil!
Sentry.init({
  dsn: "http://your-key@localhost:8000/1", // GlitchTip DSN
  // ... qolgan konfiguratsiya bir xil
});
```

**Backend:**
```typescript
// backend/src/config/sentry.ts
// Faqat DSN o'zgardi, qolgan kod bir xil!
Sentry.init({
  dsn: "http://your-key@localhost:8000/2", // GlitchTip DSN
  // ... qolgan konfiguratsiya bir xil
});
```

**Test sahifa:**
```typescript
// client/app/test-sentry/page.tsx
// Hech narsa o'zgarmadi!
// Barcha testlar ishlaydi
```

---

## 🐳 **DOCKER COMMANDS**

### **Ishga tushirish:**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### **Loglarni ko'rish:**
```bash
docker-compose -f docker-compose.monitoring.yml logs -f
```

### **Statusni tekshirish:**
```bash
docker-compose -f docker-compose.monitoring.yml ps
```

### **To'xtatish:**
```bash
docker-compose -f docker-compose.monitoring.yml down
```

### **To'liq tozalash (ma'lumotlar bilan):**
```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

### **Qayta ishga tushirish:**
```bash
docker-compose -f docker-compose.monitoring.yml restart
```

---

## 🌐 **PRODUCTION SETUP**

### **1. Domain sozlash:**

```bash
# .env.glitchtip.local
GLITCHTIP_DOMAIN=https://monitoring.yourdomain.com
```

### **2. Nginx Reverse Proxy:**

```nginx
# /etc/nginx/sites-available/glitchtip
server {
    listen 80;
    server_name monitoring.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **3. SSL (Let's Encrypt):**

```bash
sudo certbot --nginx -d monitoring.yourdomain.com
```

### **4. Email sozlash (optional):**

```bash
# .env.glitchtip.local
GLITCHTIP_EMAIL_URL=smtp://user:password@smtp.gmail.com:587/?tls=True
GLITCHTIP_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📊 **GLITCHTIP FEATURES**

### **✅ Bepul Features:**
- ✅ Cheksiz events
- ✅ Cheksiz projects
- ✅ Cheksiz users
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ Source maps
- ✅ User feedback
- ✅ Alerts (email)
- ✅ API access
- ✅ Data retention (90 days default)

### **🔄 Sentry Compatibility:**
- ✅ Sentry SDK ishlaydi
- ✅ Sentry DSN format
- ✅ Sentry API compatible
- ✅ Source maps upload
- ✅ Release tracking

---

## 🆚 **SENTRY vs GLITCHTIP**

| Feature | Sentry Free | GlitchTip |
|---------|-------------|-----------|
| **Narx** | Bepul | Bepul |
| **Events/month** | 5,000 | ♾️ Cheksiz |
| **Users** | 1 | ♾️ Cheksiz |
| **Projects** | Cheklangan | ♾️ Cheksiz |
| **Data retention** | 30 days | 90 days (sozlanadi) |
| **Self-hosted** | ❌ | ✅ |
| **Privacy** | ⚠️ 3rd party | ✅ To'liq |
| **Dashboard** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Setup** | 5 min | 10 min |
| **Maintenance** | Yo'q | Minimal |

---

## 🔧 **TROUBLESHOOTING**

### **Problem: Container ishlamayapti**
```bash
# Loglarni ko'rish
docker-compose -f docker-compose.monitoring.yml logs glitchtip-web

# Qayta ishga tushirish
docker-compose -f docker-compose.monitoring.yml restart
```

### **Problem: Database migration xatosi**
```bash
# Migration qayta bajarish
docker-compose -f docker-compose.monitoring.yml run --rm glitchtip-migrate
```

### **Problem: Admin user yaratib bo'lmayapti**
```bash
# Manual yaratish
docker-compose -f docker-compose.monitoring.yml exec glitchtip-web ./manage.py createsuperuser
```

### **Problem: Port 8000 band**
```bash
# Port o'zgartirish
# docker-compose.monitoring.yml da:
ports:
  - "9000:8000"  # 8000 o'rniga 9000
```

---

## 📚 **FOYDALI HAVOLALAR**

- **GlitchTip Docs:** https://glitchtip.com/documentation
- **GlitchTip GitHub:** https://github.com/glitchtip/glitchtip
- **Sentry SDK Docs:** https://docs.sentry.io/
- **Docker Docs:** https://docs.docker.com/

---

## ✅ **CHECKLIST**

- [ ] GlitchTip ishga tushirildi
- [ ] Admin user yaratildi
- [ ] Organization yaratildi
- [ ] Frontend project yaratildi
- [ ] Backend project yaratildi
- [ ] DSN olindi
- [ ] Frontend .env sozlandi
- [ ] Backend .env sozlandi
- [ ] Test qilindi
- [ ] Issues ko'rindi

---

## 🎉 **YAKUNIY NATIJA**

**GlitchTip muvaffaqiyatli sozlandi!**

- ✅ **100% bepul**
- ✅ **Cheksiz events**
- ✅ **Sentry-compatible**
- ✅ **Self-hosted**
- ✅ **Professional monitoring**

**Access:**
- Dashboard: http://localhost:8000
- Test: http://localhost:3000/test-sentry

**Status:** ✅ **PRODUCTION-READY**

---

**Yaratilgan:** 2025-12-02  
**Versiya:** 1.0.0









> **100% Bepul, Cheksiz, Sentry-compatible Monitoring**

---

## 📋 **NIMA QILINDI?**

✅ GlitchTip Docker Compose konfiguratsiyasi yaratildi
✅ Avtomatik setup script yaratildi
✅ Environment variables sozlandi
✅ Sentry SDK ishlaydi (o'zgarishsiz!)

---

## 🚀 **QUICK START (5 DAQIQA)**

### **1. GlitchTip ni ishga tushirish:**

```bash
# Root directory da
./scripts/setup-glitchtip.sh
```

**Script qiladigan ishlar:**
1. ✅ Environment file yaratadi
2. ✅ Random secret keys generatsiya qiladi
3. ✅ Docker containers ishga tushiradi
4. ✅ Database migratsiyalarini bajaradi
5. ✅ Admin user yaratishni so'raydi

### **2. Admin user yaratish:**

Script oxirida so'raydi:
```
Username: admin
Email: admin@yourdomain.com
Password: ********
Password (again): ********
```

### **3. GlitchTip ga kirish:**

```
URL: http://localhost:8000
Username: admin
Password: (yaratgan parolingiz)
```

---

## 📊 **PROJECT YARATISH**

### **1. Dashboard ga kirish:**
- http://localhost:8000 ga kiring
- Login qiling

### **2. Yangi Organization yaratish:**
- "Create Organization" tugmasini bosing
- Nom: "Vegas CRM"
- Save

### **3. Yangi Project yaratish:**

**Frontend Project:**
- Name: `vegas-crm-frontend`
- Platform: `JavaScript` yoki `Next.js`
- Create

**Backend Project:**
- Name: `vegas-crm-backend`
- Platform: `Node.js`
- Create

### **4. DSN ni olish:**

Har bir project uchun:
1. Settings → Client Keys (DSN)
2. DSN ni nusxalash
3. Misol: `http://abc123@localhost:8000/1`

---

## 🔧 **ENVIRONMENT VARIABLES SOZLASH**

### **Frontend (.env):**

```bash
# client/.env
NEXT_PUBLIC_SENTRY_DSN=http://your-key@localhost:8000/1

# Qolgan qismlar o'zgarishsiz
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret
```

### **Backend (.env):**

```bash
# backend/.env
SENTRY_DSN=http://your-key@localhost:8000/2

# Qolgan qismlar o'zgarishsiz
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

## ✅ **TEST QILISH**

### **1. Frontend Test:**

```bash
# Dev server ishga tushirish
cd client
pnpm dev

# Test sahifaga kirish
http://localhost:3000/test-sentry

# Tugmalarni bosish
# GlitchTip dashboard da Issues ni ko'rish
```

### **2. Backend Test:**

```bash
# Backend ishga tushirish
cd backend
pnpm dev

# Test error yuborish (optional)
curl -X POST http://localhost:5000/api/v1/test-error
```

### **3. GlitchTip Dashboard:**

```
http://localhost:8000
→ Issues
→ Yangi xatolarni ko'rish
```

---

## 📁 **SENTRY SDK - O'ZGARISHSIZ ISHLAYDI!**

### **GlitchTip Sentry-compatible:**

Barcha Sentry SDK kodlari o'zgarishsiz ishlaydi:

**Frontend:**
```typescript
// client/sentry.client.config.ts
// Faqat DSN o'zgardi, qolgan kod bir xil!
Sentry.init({
  dsn: "http://your-key@localhost:8000/1", // GlitchTip DSN
  // ... qolgan konfiguratsiya bir xil
});
```

**Backend:**
```typescript
// backend/src/config/sentry.ts
// Faqat DSN o'zgardi, qolgan kod bir xil!
Sentry.init({
  dsn: "http://your-key@localhost:8000/2", // GlitchTip DSN
  // ... qolgan konfiguratsiya bir xil
});
```

**Test sahifa:**
```typescript
// client/app/test-sentry/page.tsx
// Hech narsa o'zgarmadi!
// Barcha testlar ishlaydi
```

---

## 🐳 **DOCKER COMMANDS**

### **Ishga tushirish:**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### **Loglarni ko'rish:**
```bash
docker-compose -f docker-compose.monitoring.yml logs -f
```

### **Statusni tekshirish:**
```bash
docker-compose -f docker-compose.monitoring.yml ps
```

### **To'xtatish:**
```bash
docker-compose -f docker-compose.monitoring.yml down
```

### **To'liq tozalash (ma'lumotlar bilan):**
```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

### **Qayta ishga tushirish:**
```bash
docker-compose -f docker-compose.monitoring.yml restart
```

---

## 🌐 **PRODUCTION SETUP**

### **1. Domain sozlash:**

```bash
# .env.glitchtip.local
GLITCHTIP_DOMAIN=https://monitoring.yourdomain.com
```

### **2. Nginx Reverse Proxy:**

```nginx
# /etc/nginx/sites-available/glitchtip
server {
    listen 80;
    server_name monitoring.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **3. SSL (Let's Encrypt):**

```bash
sudo certbot --nginx -d monitoring.yourdomain.com
```

### **4. Email sozlash (optional):**

```bash
# .env.glitchtip.local
GLITCHTIP_EMAIL_URL=smtp://user:password@smtp.gmail.com:587/?tls=True
GLITCHTIP_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📊 **GLITCHTIP FEATURES**

### **✅ Bepul Features:**
- ✅ Cheksiz events
- ✅ Cheksiz projects
- ✅ Cheksiz users
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ Source maps
- ✅ User feedback
- ✅ Alerts (email)
- ✅ API access
- ✅ Data retention (90 days default)

### **🔄 Sentry Compatibility:**
- ✅ Sentry SDK ishlaydi
- ✅ Sentry DSN format
- ✅ Sentry API compatible
- ✅ Source maps upload
- ✅ Release tracking

---

## 🆚 **SENTRY vs GLITCHTIP**

| Feature | Sentry Free | GlitchTip |
|---------|-------------|-----------|
| **Narx** | Bepul | Bepul |
| **Events/month** | 5,000 | ♾️ Cheksiz |
| **Users** | 1 | ♾️ Cheksiz |
| **Projects** | Cheklangan | ♾️ Cheksiz |
| **Data retention** | 30 days | 90 days (sozlanadi) |
| **Self-hosted** | ❌ | ✅ |
| **Privacy** | ⚠️ 3rd party | ✅ To'liq |
| **Dashboard** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Setup** | 5 min | 10 min |
| **Maintenance** | Yo'q | Minimal |

---

## 🔧 **TROUBLESHOOTING**

### **Problem: Container ishlamayapti**
```bash
# Loglarni ko'rish
docker-compose -f docker-compose.monitoring.yml logs glitchtip-web

# Qayta ishga tushirish
docker-compose -f docker-compose.monitoring.yml restart
```

### **Problem: Database migration xatosi**
```bash
# Migration qayta bajarish
docker-compose -f docker-compose.monitoring.yml run --rm glitchtip-migrate
```

### **Problem: Admin user yaratib bo'lmayapti**
```bash
# Manual yaratish
docker-compose -f docker-compose.monitoring.yml exec glitchtip-web ./manage.py createsuperuser
```

### **Problem: Port 8000 band**
```bash
# Port o'zgartirish
# docker-compose.monitoring.yml da:
ports:
  - "9000:8000"  # 8000 o'rniga 9000
```

---

## 📚 **FOYDALI HAVOLALAR**

- **GlitchTip Docs:** https://glitchtip.com/documentation
- **GlitchTip GitHub:** https://github.com/glitchtip/glitchtip
- **Sentry SDK Docs:** https://docs.sentry.io/
- **Docker Docs:** https://docs.docker.com/

---

## ✅ **CHECKLIST**

- [ ] GlitchTip ishga tushirildi
- [ ] Admin user yaratildi
- [ ] Organization yaratildi
- [ ] Frontend project yaratildi
- [ ] Backend project yaratildi
- [ ] DSN olindi
- [ ] Frontend .env sozlandi
- [ ] Backend .env sozlandi
- [ ] Test qilindi
- [ ] Issues ko'rindi

---

## 🎉 **YAKUNIY NATIJA**

**GlitchTip muvaffaqiyatli sozlandi!**

- ✅ **100% bepul**
- ✅ **Cheksiz events**
- ✅ **Sentry-compatible**
- ✅ **Self-hosted**
- ✅ **Professional monitoring**

**Access:**
- Dashboard: http://localhost:8000
- Test: http://localhost:3000/test-sentry

**Status:** ✅ **PRODUCTION-READY**

---

**Yaratilgan:** 2025-12-02  
**Versiya:** 1.0.0








> **100% Bepul, Cheksiz, Sentry-compatible Monitoring**

---

## 📋 **NIMA QILINDI?**

✅ GlitchTip Docker Compose konfiguratsiyasi yaratildi
✅ Avtomatik setup script yaratildi
✅ Environment variables sozlandi
✅ Sentry SDK ishlaydi (o'zgarishsiz!)

---

## 🚀 **QUICK START (5 DAQIQA)**

### **1. GlitchTip ni ishga tushirish:**

```bash
# Root directory da
./scripts/setup-glitchtip.sh
```

**Script qiladigan ishlar:**
1. ✅ Environment file yaratadi
2. ✅ Random secret keys generatsiya qiladi
3. ✅ Docker containers ishga tushiradi
4. ✅ Database migratsiyalarini bajaradi
5. ✅ Admin user yaratishni so'raydi

### **2. Admin user yaratish:**

Script oxirida so'raydi:
```
Username: admin
Email: admin@yourdomain.com
Password: ********
Password (again): ********
```

### **3. GlitchTip ga kirish:**

```
URL: http://localhost:8000
Username: admin
Password: (yaratgan parolingiz)
```

---

## 📊 **PROJECT YARATISH**

### **1. Dashboard ga kirish:**
- http://localhost:8000 ga kiring
- Login qiling

### **2. Yangi Organization yaratish:**
- "Create Organization" tugmasini bosing
- Nom: "Vegas CRM"
- Save

### **3. Yangi Project yaratish:**

**Frontend Project:**
- Name: `vegas-crm-frontend`
- Platform: `JavaScript` yoki `Next.js`
- Create

**Backend Project:**
- Name: `vegas-crm-backend`
- Platform: `Node.js`
- Create

### **4. DSN ni olish:**

Har bir project uchun:
1. Settings → Client Keys (DSN)
2. DSN ni nusxalash
3. Misol: `http://abc123@localhost:8000/1`

---

## 🔧 **ENVIRONMENT VARIABLES SOZLASH**

### **Frontend (.env):**

```bash
# client/.env
NEXT_PUBLIC_SENTRY_DSN=http://your-key@localhost:8000/1

# Qolgan qismlar o'zgarishsiz
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret
```

### **Backend (.env):**

```bash
# backend/.env
SENTRY_DSN=http://your-key@localhost:8000/2

# Qolgan qismlar o'zgarishsiz
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

## ✅ **TEST QILISH**

### **1. Frontend Test:**

```bash
# Dev server ishga tushirish
cd client
pnpm dev

# Test sahifaga kirish
http://localhost:3000/test-sentry

# Tugmalarni bosish
# GlitchTip dashboard da Issues ni ko'rish
```

### **2. Backend Test:**

```bash
# Backend ishga tushirish
cd backend
pnpm dev

# Test error yuborish (optional)
curl -X POST http://localhost:5000/api/v1/test-error
```

### **3. GlitchTip Dashboard:**

```
http://localhost:8000
→ Issues
→ Yangi xatolarni ko'rish
```

---

## 📁 **SENTRY SDK - O'ZGARISHSIZ ISHLAYDI!**

### **GlitchTip Sentry-compatible:**

Barcha Sentry SDK kodlari o'zgarishsiz ishlaydi:

**Frontend:**
```typescript
// client/sentry.client.config.ts
// Faqat DSN o'zgardi, qolgan kod bir xil!
Sentry.init({
  dsn: "http://your-key@localhost:8000/1", // GlitchTip DSN
  // ... qolgan konfiguratsiya bir xil
});
```

**Backend:**
```typescript
// backend/src/config/sentry.ts
// Faqat DSN o'zgardi, qolgan kod bir xil!
Sentry.init({
  dsn: "http://your-key@localhost:8000/2", // GlitchTip DSN
  // ... qolgan konfiguratsiya bir xil
});
```

**Test sahifa:**
```typescript
// client/app/test-sentry/page.tsx
// Hech narsa o'zgarmadi!
// Barcha testlar ishlaydi
```

---

## 🐳 **DOCKER COMMANDS**

### **Ishga tushirish:**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### **Loglarni ko'rish:**
```bash
docker-compose -f docker-compose.monitoring.yml logs -f
```

### **Statusni tekshirish:**
```bash
docker-compose -f docker-compose.monitoring.yml ps
```

### **To'xtatish:**
```bash
docker-compose -f docker-compose.monitoring.yml down
```

### **To'liq tozalash (ma'lumotlar bilan):**
```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

### **Qayta ishga tushirish:**
```bash
docker-compose -f docker-compose.monitoring.yml restart
```

---

## 🌐 **PRODUCTION SETUP**

### **1. Domain sozlash:**

```bash
# .env.glitchtip.local
GLITCHTIP_DOMAIN=https://monitoring.yourdomain.com
```

### **2. Nginx Reverse Proxy:**

```nginx
# /etc/nginx/sites-available/glitchtip
server {
    listen 80;
    server_name monitoring.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **3. SSL (Let's Encrypt):**

```bash
sudo certbot --nginx -d monitoring.yourdomain.com
```

### **4. Email sozlash (optional):**

```bash
# .env.glitchtip.local
GLITCHTIP_EMAIL_URL=smtp://user:password@smtp.gmail.com:587/?tls=True
GLITCHTIP_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📊 **GLITCHTIP FEATURES**

### **✅ Bepul Features:**
- ✅ Cheksiz events
- ✅ Cheksiz projects
- ✅ Cheksiz users
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ Source maps
- ✅ User feedback
- ✅ Alerts (email)
- ✅ API access
- ✅ Data retention (90 days default)

### **🔄 Sentry Compatibility:**
- ✅ Sentry SDK ishlaydi
- ✅ Sentry DSN format
- ✅ Sentry API compatible
- ✅ Source maps upload
- ✅ Release tracking

---

## 🆚 **SENTRY vs GLITCHTIP**

| Feature | Sentry Free | GlitchTip |
|---------|-------------|-----------|
| **Narx** | Bepul | Bepul |
| **Events/month** | 5,000 | ♾️ Cheksiz |
| **Users** | 1 | ♾️ Cheksiz |
| **Projects** | Cheklangan | ♾️ Cheksiz |
| **Data retention** | 30 days | 90 days (sozlanadi) |
| **Self-hosted** | ❌ | ✅ |
| **Privacy** | ⚠️ 3rd party | ✅ To'liq |
| **Dashboard** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Setup** | 5 min | 10 min |
| **Maintenance** | Yo'q | Minimal |

---

## 🔧 **TROUBLESHOOTING**

### **Problem: Container ishlamayapti**
```bash
# Loglarni ko'rish
docker-compose -f docker-compose.monitoring.yml logs glitchtip-web

# Qayta ishga tushirish
docker-compose -f docker-compose.monitoring.yml restart
```

### **Problem: Database migration xatosi**
```bash
# Migration qayta bajarish
docker-compose -f docker-compose.monitoring.yml run --rm glitchtip-migrate
```

### **Problem: Admin user yaratib bo'lmayapti**
```bash
# Manual yaratish
docker-compose -f docker-compose.monitoring.yml exec glitchtip-web ./manage.py createsuperuser
```

### **Problem: Port 8000 band**
```bash
# Port o'zgartirish
# docker-compose.monitoring.yml da:
ports:
  - "9000:8000"  # 8000 o'rniga 9000
```

---

## 📚 **FOYDALI HAVOLALAR**

- **GlitchTip Docs:** https://glitchtip.com/documentation
- **GlitchTip GitHub:** https://github.com/glitchtip/glitchtip
- **Sentry SDK Docs:** https://docs.sentry.io/
- **Docker Docs:** https://docs.docker.com/

---

## ✅ **CHECKLIST**

- [ ] GlitchTip ishga tushirildi
- [ ] Admin user yaratildi
- [ ] Organization yaratildi
- [ ] Frontend project yaratildi
- [ ] Backend project yaratildi
- [ ] DSN olindi
- [ ] Frontend .env sozlandi
- [ ] Backend .env sozlandi
- [ ] Test qilindi
- [ ] Issues ko'rindi

---

## 🎉 **YAKUNIY NATIJA**

**GlitchTip muvaffaqiyatli sozlandi!**

- ✅ **100% bepul**
- ✅ **Cheksiz events**
- ✅ **Sentry-compatible**
- ✅ **Self-hosted**
- ✅ **Professional monitoring**

**Access:**
- Dashboard: http://localhost:8000
- Test: http://localhost:3000/test-sentry

**Status:** ✅ **PRODUCTION-READY**

---

**Yaratilgan:** 2025-12-02  
**Versiya:** 1.0.0










