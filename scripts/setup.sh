#!/bin/bash

# Budget Tracker - Quick Start Script

echo "🚀 Budget Tracker - Quick Start"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "================================"
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start MongoDB (if running locally)"
echo "   mongod"
echo ""
echo "2. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "Happy budgeting! 💰"
