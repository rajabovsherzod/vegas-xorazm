# 🚀 GLITCHTIP - QUICK START

> **5 daqiqada ishga tushiring!**

---

## ⚡ **TEZKOR BOSHLASH**

### **1. GlitchTip ni ishga tushirish:**

```bash
cd /home/sherzod-rajabov/Desktop/vegas
./scripts/setup-glitchtip.sh
```

**Kutish vaqti:** 2-3 daqiqa

### **2. Admin user yaratish:**

Script so'raydi:
```
Username: admin
Email: admin@localhost
Password: admin123  (yoki istalgan parol)
Password (again): admin123
```

### **3. GlitchTip ga kirish:**

```
URL: http://localhost:8000
Username: admin
Password: admin123
```

---

## 📊 **PROJECT SOZLASH (2 daqiqa)**

### **1. Organization yaratish:**
- "Create Organization" → "Vegas CRM" → Save

### **2. Frontend Project:**
- "Create Project"
- Name: `vegas-crm-frontend`
- Platform: `JavaScript`
- Create

### **3. Backend Project:**
- "Create Project"
- Name: `vegas-crm-backend`
- Platform: `Node.js`
- Create

### **4. DSN ni olish:**

**Frontend:**
1. `vegas-crm-frontend` → Settings → Client Keys
2. DSN ni nusxalash: `http://abc123@localhost:8000/1`

**Backend:**
1. `vegas-crm-backend` → Settings → Client Keys
2. DSN ni nusxalash: `http://xyz789@localhost:8000/2`

---

## 🔧 **ENVIRONMENT SOZLASH (1 daqiqa)**

### **Frontend:**

```bash
# client/.env
NEXT_PUBLIC_SENTRY_DSN=http://abc123@localhost:8000/1
```

### **Backend:**

```bash
# backend/.env
SENTRY_DSN=http://xyz789@localhost:8000/2
```

---

## ✅ **TEST QILISH (1 daqiqa)**

### **1. Serverlarni ishga tushirish:**

```bash
# Terminal 1: Backend
cd backend
pnpm dev

# Terminal 2: Frontend
cd client
pnpm dev
```

### **2. Test sahifaga kirish:**

```
http://localhost:3000/test-sentry
```

### **3. Tugmalarni bosish:**

- "Test JavaScript Error" tugmasini bosing
- "Test Custom Message" tugmasini bosing

### **4. GlitchTip da ko'rish:**

```
http://localhost:8000 → Issues
```

Yangi xatolarni ko'rasiz! ✅

---

## 🎉 **TAYYOR!**

**GlitchTip muvaffaqiyatli sozlandi!**

- ✅ 100% bepul
- ✅ Cheksiz events
- ✅ Professional monitoring
- ✅ Sentry-compatible

---

## 📝 **KEYINGI QADAMLAR**

1. ✅ Production da ishlatish uchun domain sozlang
2. ✅ SSL sertifikat o'rnating
3. ✅ Email notifications sozlang
4. ✅ Alerts sozlang

**To'liq qo'llanma:** `GLITCHTIP_SETUP.md`

---

**Ishga tushirish vaqti:** 5 daqiqa ⏱️  
**Status:** ✅ **TAYYOR**

