#!/bin/bash

# Budget Tracker - Easy Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting Budget Tracker Application..."
echo ""

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start backend
echo ""
echo "📦 Starting Backend (Port 5000)..."
cd /home/sujal/practice/Budget_calulation/backend
npm start > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Check if backend started
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend running on http://localhost:5000"
else
    echo "❌ Backend failed to start. Check backend.log for errors"
    exit 1
fi

# Start frontend
echo ""
echo "🎨 Starting Frontend (Port 5173)..."
cd /home/sujal/practice/Budget_calulation/frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

echo ""
echo "✅ Application started successfully!"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend:  http://localhost:5000"
echo ""
echo "📋 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /home/sujal/practice/Budget_calulation/backend/backend.log"
echo "   Frontend: tail -f /home/sujal/practice/Budget_calulation/frontend/frontend.log"
echo ""
echo "🛑 To stop: pkill -f 'node server.js'; pkill -f 'vite'"
echo ""
echo "🎉 Ready to use! Open http://localhost:5173 in your browser"
