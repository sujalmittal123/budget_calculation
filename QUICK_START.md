# 🔐 Google OAuth Configuration Checklist

## Current Configuration

Your application is configured with these ports:
- **Frontend:** `http://localhost:5173` (Vite default)
- **Backend:** `http://localhost:5000`

## ✅ Required Google Cloud Console Settings

Go to: https://console.cloud.google.com/apis/credentials

### 1. Authorized JavaScript Origins

Add both of these:
```
http://localhost:5173
http://localhost:5000
```

### 2. Authorized Redirect URIs

Add this exact URL:
```
http://localhost:5000/api/auth/callback/google
```

**⚠️ IMPORTANT:** The redirect URI must be **exactly** this. It points to your **backend** (port 5000), not frontend!

## 🔑 Environment Variables

### Backend `.env` (already configured):
```bash
PORT=5000
BETTER_AUTH_URL=http://localhost:5000
GOOGLE_CLIENT_ID=91377509780-5ku8nd5nk20fegn3s9fko3junf88d5tq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE  # ⚠️ You need to add this!
APP_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://...
BETTER_AUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Frontend `.env` (no changes needed):
```bash
# No environment variables needed!
```

## 🚀 How to Start the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Expected output:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## 🧪 Testing

1. Open: http://localhost:5173
2. You should see the login page
3. Click "Continue with Google"
4. Google OAuth popup should appear
5. After authentication, you'll be redirected to the dashboard

## 🔧 What Still Needs to Be Done

### 1. Get Google Client Secret

You have the Client ID, but you still need the **Client Secret**:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `91377509780-5ku8nd5nk20fegn3s9fko3junf88d5tq`
3. Click on it to open details
4. Copy the **Client Secret** (looks like `GOCSPX-xxxxxxxxxxxxx`)
5. Add it to `backend/.env`:
   ```bash
   GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here
   ```

### 2. Verify Google Cloud Console Settings

Make sure you have:
- ✅ **Authorized JavaScript origins:**
  - `http://localhost:5173`
  - `http://localhost:5000`
  
- ✅ **Authorized redirect URIs:**
  - `http://localhost:5000/api/auth/callback/google`

### 3. OAuth Consent Screen

Make sure:
- ✅ App name: "Budget Tracker" (or your preferred name)
- ✅ User support email: Your email
- ✅ Scopes: email, profile, openid (these are default)
- ✅ Test users: Add your Gmail address (if app is in testing mode)

## 🐛 Common Issues

### "redirect_uri_mismatch"
- **Cause:** The redirect URI in Google Console doesn't match exactly
- **Fix:** Make sure it's `http://localhost:5000/api/auth/callback/google` (no trailing slash!)

### "Access blocked: This app's request is invalid"
- **Cause:** OAuth consent screen not configured or missing scopes
- **Fix:** Go to OAuth Consent Screen and add required information

### "401 Unauthorized" or CORS errors
- **Cause:** Backend not running or CORS misconfigured
- **Fix:** Make sure backend is running on port 5000 and `APP_URL=http://localhost:5173`

### Frontend doesn't load on port 5173
- **Cause:** Port might be in use
- **Fix:** Kill any process using port 5173: `npx kill-port 5173`

## 📋 Quick Setup Summary

```bash
# 1. Add Google Client Secret to backend/.env
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here

# 2. Start backend
cd backend && npm run dev

# 3. Start frontend (new terminal)
cd frontend && npm run dev

# 4. Visit http://localhost:5173
# 5. Click "Continue with Google"
# 6. Authenticate and you're in!
```

## 🎉 You're Almost Done!

Just need to:
1. ✅ Get your Google Client Secret
2. ✅ Verify Google OAuth settings
3. ✅ Start both servers
4. ✅ Test the login flow

Everything else is configured and ready to go! 🚀
