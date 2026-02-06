#!/bin/bash

# Build script for Render deployment
# This script is used if deploying as a single service

echo "🚀 Starting Build Process..."

# Build Backend (if TypeScript is being used)
echo "📦 Building Backend..."
cd backend
npm install --production=false
if [ -f "tsconfig.json" ]; then
  npm run build-ts 2>/dev/null || echo "⚠️  TypeScript build skipped"
fi
cd ..

# Build Frontend
echo "🎨 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build Complete!"
