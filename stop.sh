#!/bin/bash

# Budget Tracker - Stop Script

echo "🛑 Stopping Budget Tracker Application..."
echo ""

# Stop backend
echo "📦 Stopping Backend..."
pkill -f "node server.js"

# Stop frontend  
echo "🎨 Stopping Frontend..."
pkill -f "vite"

sleep 2

echo ""
echo "✅ Application stopped"
echo ""
echo "📝 Check logs if needed:"
echo "   Backend:  /home/sujal/practice/Budget_calulation/backend/backend.log"
echo "   Frontend: /home/sujal/practice/Budget_calulation/frontend/frontend.log"
