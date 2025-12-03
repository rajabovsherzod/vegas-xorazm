#!/bin/bash

# GlitchTip Setup Script
# Usage: ./scripts/setup-glitchtip.sh

set -e

echo "🚀 ========================================="
echo "   GLITCHTIP SETUP"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker ishlamayapti. Iltimos, Docker ni ishga tushiring."
    exit 1
fi

# Check if .env.glitchtip.local exists
if [ ! -f ".env.glitchtip.local" ]; then
    info "Environment file yaratilmoqda..."
    cp .env.glitchtip .env.glitchtip.local
    
    # Generate random secret key
    SECRET_KEY=$(openssl rand -base64 50 | tr -d "=+/" | cut -c1-50)
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    # Update .env.glitchtip.local
    sed -i "s/glitchtip_super_secret_password_change_this/$DB_PASSWORD/g" .env.glitchtip.local
    sed -i "s/your-super-secret-key-min-50-chars-change-this-to-random-string/$SECRET_KEY/g" .env.glitchtip.local
    
    success "Environment file yaratildi: .env.glitchtip.local"
    info "Iltimos, .env.glitchtip.local faylini tekshiring va kerakli o'zgarishlarni kiriting."
fi

# Load environment variables
export $(cat .env.glitchtip.local | xargs)

echo ""
info "GlitchTip ishga tushirilmoqda..."
echo ""

# Start services
docker-compose -f docker-compose.monitoring.yml up -d

echo ""
info "Migratsiyalar bajarilmoqda..."
sleep 5

# Wait for postgres to be ready
until docker-compose -f docker-compose.monitoring.yml exec -T glitchtip-postgres pg_isready -U glitchtip > /dev/null 2>&1; do
    info "PostgreSQL kutilmoqda..."
    sleep 2
done

success "PostgreSQL tayyor!"

# Run migrations
docker-compose -f docker-compose.monitoring.yml run --rm glitchtip-migrate

echo ""
success "GlitchTip muvaffaqiyatli ishga tushdi!"
echo ""

# Create superuser
echo "========================================="
echo "   ADMIN USER YARATISH"
echo "========================================="
echo ""
info "Admin user yaratish uchun quyidagi ma'lumotlarni kiriting:"
echo ""

docker-compose -f docker-compose.monitoring.yml exec glitchtip-web ./manage.py createsuperuser

echo ""
echo "========================================="
echo "   MUVAFFAQIYATLI YAKUNLANDI!"
echo "========================================="
echo ""
success "GlitchTip ishga tushdi: http://localhost:8000"
echo ""
info "Keyingi qadamlar:"
echo "  1. http://localhost:8000 ga kiring"
echo "  2. Admin user bilan login qiling"
echo "  3. Yangi project yarating"
echo "  4. DSN ni oling"
echo "  5. DSN ni .env fayllariga qo'shing"
echo ""
info "Loglarni ko'rish:"
echo "  docker-compose -f docker-compose.monitoring.yml logs -f"
echo ""
info "To'xtatish:"
echo "  docker-compose -f docker-compose.monitoring.yml down"
echo ""

