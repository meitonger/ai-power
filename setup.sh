#!/bin/bash
set -e

echo "🚀 AI Power - Mobile Tire Service Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup API
echo "📦 Setting up API..."
cd apps/api

if [ ! -f ".env" ]; then
    echo "${YELLOW}⚠️  Creating .env file from template${NC}"
    cp .env.example .env
    echo "📝 Please edit apps/api/.env with your configuration"
else
    echo "✅ .env file already exists"
fi

echo "📦 Installing API dependencies..."
npm install

echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate dev --name init

echo "🌱 Seeding database (optional)..."
npm run db:seed || echo "${YELLOW}⚠️  Seeding skipped or failed${NC}"

cd ../..

# Setup Web
echo ""
echo "📦 Setting up Web application..."
cd apps/web

if [ ! -f ".env.local" ]; then
    echo "${YELLOW}⚠️  Creating .env.local file from template${NC}"
    cp .env.local.example .env.local
    echo "📝 Please edit apps/web/.env.local with your configuration"
else
    echo "✅ .env.local file already exists"
fi

echo "📦 Installing Web dependencies..."
npm install

cd ../..

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit configuration files:"
echo "   - apps/api/.env"
echo "   - apps/web/.env.local"
echo ""
echo "2. Start the development servers:"
echo "   ./start-dev.sh"
echo ""
echo "3. Or start them manually:"
echo "   Terminal 1: cd apps/api && npm run dev"
echo "   Terminal 2: cd apps/web && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
