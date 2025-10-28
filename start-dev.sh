#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 Starting AI Power Development Servers"
echo "========================================"

# Check if .env files exist
if [ ! -f "apps/api/.env" ]; then
    echo "❌ apps/api/.env not found. Run ./setup.sh first!"
    exit 1
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo "❌ apps/web/.env.local not found. Run ./setup.sh first!"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $API_PID $WEB_PID 2>/dev/null
    exit
}

trap cleanup INT TERM

# Start API server in background
echo "${BLUE}📡 Starting API server on port 3001...${NC}"
cd apps/api
npm run dev > ../../logs/api.log 2>&1 &
API_PID=$!
cd ../..

# Wait a bit for API to start
sleep 3

# Start Web server in background
echo "${BLUE}🌐 Starting Web server on port 3000...${NC}"
cd apps/web
npm run dev > ../../logs/web.log 2>&1 &
WEB_PID=$!
cd ../..

sleep 2

echo ""
echo "${GREEN}✅ Servers started!${NC}"
echo ""
echo "📡 API:  http://localhost:3001/api"
echo "🌐 Web:  http://localhost:3000"
echo "📊 GraphQL: http://localhost:3001/api/graphql"
echo ""
echo "📝 Logs are in ./logs/ directory"
echo "   - API: tail -f logs/api.log"
echo "   - Web: tail -f logs/web.log"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
