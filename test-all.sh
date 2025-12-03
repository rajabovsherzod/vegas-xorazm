#!/bin/bash

# VEGAS CRM - Full System Test Script
# Usage: ./test-all.sh

set -e  # Exit on error

echo "🧪 ========================================="
echo "   VEGAS CRM - FULL SYSTEM TEST"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

# Function to print info
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Frontend Tests
echo "📦 Testing Frontend..."
echo "-------------------------------------------"
cd client
if pnpm test --passWithNoTests; then
    success "Frontend tests passed"
else
    error "Frontend tests failed"
fi
echo ""

# 2. Frontend Build
echo "🏗️  Building Frontend..."
echo "-------------------------------------------"
if pnpm build; then
    success "Frontend build successful"
else
    error "Frontend build failed"
fi
cd ..
echo ""

# 3. Backend Build
echo "🏗️  Building Backend..."
echo "-------------------------------------------"
cd backend
if pnpm build; then
    success "Backend build successful"
else
    error "Backend build failed"
fi
cd ..
echo ""

# 4. Docker Build Test
echo "🐳 Testing Docker Build..."
echo "-------------------------------------------"
info "Building backend image..."
if docker build -t vegas-backend:test ./backend; then
    success "Backend Docker image built"
else
    error "Backend Docker build failed"
fi

info "Building frontend image..."
if docker build -t vegas-frontend:test \
    --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 \
    --build-arg NEXT_PUBLIC_WS_URL=http://localhost:5000 \
    --build-arg NEXTAUTH_SECRET=test-secret \
    ./client; then
    success "Frontend Docker image built"
else
    error "Frontend Docker build failed"
fi
echo ""

# 5. Docker Compose Validation
echo "🐳 Validating docker-compose..."
echo "-------------------------------------------"
if docker-compose config > /dev/null 2>&1; then
    success "docker-compose.yml is valid"
else
    error "docker-compose.yml has errors"
fi
echo ""

# 6. Environment Files Check
echo "📝 Checking Environment Files..."
echo "-------------------------------------------"
if [ -f "client/.env.example" ]; then
    success "Frontend .env.example exists"
else
    error "Frontend .env.example missing"
fi

if [ -f "backend/.env.example" ]; then
    success "Backend .env.example exists"
else
    error "Backend .env.example missing"
fi
echo ""

# 7. Documentation Check
echo "📚 Checking Documentation..."
echo "-------------------------------------------"
if [ -f "README.md" ]; then
    success "README.md exists"
else
    error "README.md missing"
fi

if [ -f "TESTING_GUIDE.md" ]; then
    success "TESTING_GUIDE.md exists"
else
    error "TESTING_GUIDE.md missing"
fi

if [ -f "FINAL_REPORT.md" ]; then
    success "FINAL_REPORT.md exists"
else
    error "FINAL_REPORT.md missing"
fi
echo ""

# 8. CI/CD Files Check
echo "🔄 Checking CI/CD Configuration..."
echo "-------------------------------------------"
if [ -f ".github/workflows/ci.yml" ]; then
    success "CI workflow exists"
else
    error "CI workflow missing"
fi

if [ -f ".github/workflows/cd.yml" ]; then
    success "CD workflow exists"
else
    error "CD workflow missing"
fi
echo ""

# Final Report
echo "========================================="
echo "   TEST SUMMARY"
echo "========================================="
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! System is ready for production!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please fix the issues above.${NC}"
    exit 1
fi

