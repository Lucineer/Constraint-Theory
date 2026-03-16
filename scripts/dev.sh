#!/bin/bash

# Constraint Theory - Local Development Script
# This script sets up and runs the local development environment

set -e

echo "🚀 Constraint Theory - Local Development Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v20+${NC}"
    exit 1
fi

if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Docker features will be unavailable.${NC}"
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
cd workers
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build TypeScript
echo -e "${BLUE}Building TypeScript...${NC}"
npm run build
echo -e "${GREEN}✓ TypeScript built${NC}"
echo ""

# Build WASM module (if Rust is installed)
if command -v wasm-pack &> /dev/null; then
    echo -e "${BLUE}Building WASM module...${NC}"
    cd ../packages/constraint-theory-wasm
    wasm-pack build --target web
    cd ../..
    echo -e "${GREEN}✓ WASM module built${NC}"
    echo ""
else
    echo -e "${YELLOW}Rust/WASM not found. Skipping WASM build.${NC}"
    echo ""
fi

# Check if KV namespaces are configured
echo -e "${BLUE}Checking KV namespaces...${NC}"
if grep -q "id = \"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\"" workers/wrangler.toml; then
    echo -e "${YELLOW}⚠ KV namespaces not configured. Run 'wrangler kv:namespace create' to set them up.${NC}"
else
    echo -e "${GREEN}✓ KV namespaces configured${NC}"
fi
echo ""

# Menu
echo "What would you like to do?"
echo ""
echo "1) Start Workers development server"
echo "2) Build Docker container"
echo "3) Run tests"
echo "4) Deploy to Workers (staging)"
echo "5) Deploy to Workers (production)"
echo "6) View logs"
echo "7) Exit"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo -e "${GREEN}Starting Workers development server...${NC}"
        cd workers
        wrangler dev
        ;;
    2)
        if command -v docker &> /dev/null; then
            echo -e "${GREEN}Building Docker container...${NC}"
            cd docker
            docker build -t constraint-theory-worker:latest ..
            echo -e "${GREEN}✓ Docker image built${NC}"
            echo "Run 'docker run -p 8080:8080 constraint-theory-worker:latest' to start"
        else
            echo -e "${RED}Docker not found. Please install Docker.${NC}"
        fi
        ;;
    3)
        echo -e "${GREEN}Running tests...${NC}"
        cd workers
        npm test
        ;;
    4)
        echo -e "${YELLOW}Deploying to staging...${NC}"
        cd workers
        wrangler deploy
        ;;
    5)
        echo -e "${YELLOW}Deploying to production...${NC}"
        cd workers
        wrangler deploy --env production
        ;;
    6)
        echo -e "${GREEN}Tailing logs...${NC}"
        cd workers
        wrangler tail --format pretty
        ;;
    7)
        echo "Goodbye! 👋"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac
