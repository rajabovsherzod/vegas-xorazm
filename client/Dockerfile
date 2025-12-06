# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# --- Dependencies ---
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build stage ---
FROM base AS build
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXTAUTH_SECRET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
RUN pnpm run build

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy build output from the correct stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["pnpm", "start"]
