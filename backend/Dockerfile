# --- Build Stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Pnpm ni o'rnatish
RUN npm install -g pnpm

# .npmrc faylini ham nusxalash kerak (yangi qo'shgan faylimiz)
COPY package.json pnpm-lock.yaml .npmrc ./

# Dependencies o'rnatish (endi hoisted rejimda o'rnatiladi)
RUN pnpm install --no-frozen-lockfile

# Kodni nusxalash
COPY . .

# Build qilish
RUN pnpm run build

# --- Production Stage ---
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g pnpm

ENV NODE_ENV=production

# Kerakli fayllarni nusxalash
COPY package.json pnpm-lock.yaml .npmrc ./

# Faqat production kutubxonalarini o'rnatish
RUN pnpm install --prod --no-frozen-lockfile

# Builddan chiqqan fayllarni olish
COPY --from=build /app/dist ./dist
# Agar kerak bo'lsa, drizzle papkasini ham oching:
# COPY --from=build /app/drizzle ./drizzle

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]