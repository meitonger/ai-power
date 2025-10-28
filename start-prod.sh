#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Starting AI Power Production Servers"
echo "========================================"

# Check if built
if [ ! -d "apps/api/dist" ]; then
    echo "${YELLOW}⚠️  API not built. Building now...${NC}"
    cd apps/api && npm run build && cd ../..
fi

if [ ! -d "apps/web/.next" ]; then
    echo "${YELLOW}⚠️  Web not built. Building now...${NC}"
    cd apps/web && npm run build && cd ../..
fi

# Function to cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $API_PID $WEB_PID 2>/dev/null
    exit
}

trap cleanup INT TERM

# Start API
echo "${BLUE}📡 Starting API server...${NC}"
cd apps/api
NODE_ENV=production npm start > ../../logs/api-prod.log 2>&1 &
API_PID=$!
cd ../..

sleep 3

# Start Web
echo "${BLUE}🌐 Starting Web server...${NC}"
cd apps/web
NODE_ENV=production npm start > ../../logs/web-prod.log 2>&1 &
WEB_PID=$!
cd ../..

sleep 2

echo ""
echo "${GREEN}✅ Production servers started!${NC}"
echo ""
echo "📡 API:  http://localhost:3001/api"
echo "🌐 Web:  http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   - tail -f logs/api-prod.log"
echo "   - tail -f logs/web-prod.log"
echo ""
echo "Press Ctrl+C to stop all servers"

wait
