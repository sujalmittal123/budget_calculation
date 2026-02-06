# ⚠️ IMPORTANT: Which Commands to Use

## ✅ CORRECT Commands

### Backend (Choose ONE):

**Option 1: Production mode (recommended)**
```bash
cd /home/sujal/practice/Budget_calulation/backend
npm start
```

**Option 2: Development mode with auto-restart**
```bash
cd /home/sujal/practice/Budget_calulation/backend
npm run dev
```

### Frontend:
```bash
cd /home/sujal/practice/Budget_calulation/frontend
npm run dev
```

---

## ❌ DO NOT USE These Commands

### Backend - DON'T USE:
```bash
# ❌ WRONG - This tries to use TypeScript
npm run dev-ts

# ❌ WRONG - This needs TypeScript build
npm run start-ts
```

**Why?** The backend is JavaScript (`server.js`), not TypeScript. The TypeScript structure in `/backend/src/` is not being used.

---

## 🐛 If You See "tsx killing" Errors

This happens if you accidentally ran a TypeScript command. Fix it:

```bash
# Kill everything
pkill -9 tsx
pkill -9 node
pkill -9 nodemon

# Clear port
lsof -ti:5000 | xargs kill -9

# Start fresh
npm start
```

---

## 🚀 Easiest Way (Use This!)

Instead of manual commands, use the startup script:

```bash
cd /home/sujal/practice/Budget_calulation
./start.sh
```

This automatically:
- Cleans up old processes
- Starts backend correctly
- Starts frontend
- Shows you the URLs

---

## 📝 Summary

| Command | What It Does | Should You Use? |
|---------|--------------|-----------------|
| `npm start` | Runs `node server.js` | ✅ YES |
| `npm run dev` | Runs `nodemon server.js` | ✅ YES (dev only) |
| `npm run dev-ts` | Tries to run TypeScript | ❌ NO |
| `./start.sh` | Starts everything | ✅ YES (easiest) |

**Just use `npm start` or `./start.sh` and you'll be fine!** 👍
