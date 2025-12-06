# --- Base Stage ---
FROM node:20-alpine AS base
WORKDIR /app
# Pnpm ni global o'rnatish
RUN npm install -g pnpm

# --- Dependencies Stage ---
FROM base AS deps
WORKDIR /app

# Fayllarni nusxalash (.npmrc juda muhim!)
COPY package.json pnpm-lock.yaml .npmrc ./

# Dependencies o'rnatish (hoisted rejimda)
RUN pnpm install --no-frozen-lockfile

# --- Builder Stage ---
FROM base AS builder
WORKDIR /app

# Deps bosqichidan node_modules ni olib o'tamiz
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment o'zgaruvchilarni qabul qilish (Build paytida kerak)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXTAUTH_SECRET

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Build qilish (Endi Next topiladi)
RUN pnpm run build

# --- Production Stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Next.js uchun kerakli user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Fayllarni nusxalash
COPY --from=builder /app/public ./public

# Standalone buildni nusxalash (Next.js 12+ xususiyati)
# Eslatma: next.config.ts da output: 'standalone' bo'lishi kerak
# Agar sizda yo'q bo'lsa, pastdagi COPY .next qismini ishlating
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]