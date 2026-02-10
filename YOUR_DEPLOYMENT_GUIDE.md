# ⚡ Your Deployment Quick Reference

## 🌐 Your URLs

- **Frontend (Vercel)**: https://budget-calculation.vercel.app ✅ DEPLOYED
- **Backend (Render)**: _Pending deployment_ 🔄

---

## 🎯 Next Steps to Complete Deployment

### 1️⃣ Deploy Backend to Render (10 minutes)

Go to [dashboard.render.com](https://dashboard.render.com) → New → Web Service

**Copy these exact settings:**

```
Name: budget-tracker-backend
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

**Add these 10 environment variables:**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://budgetapp:RE7wnpkROoptsYxK@cluster0.flc6kb4.mongodb.net/budget-tracker?retryWrites=true&w=majority
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
BETTER_AUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
FRONTEND_URL=https://budget-calculation.vercel.app
APP_URL=https://budget-calculation.vercel.app
GOOGLE_CLIENT_ID=91377509780-5ku8nd5nk20fegn3s9fko3junf88d5tq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**AFTER deployment, add these 2 more (using your actual backend URL):**
```env
BETTER_AUTH_URL=https://[YOUR-BACKEND].onrender.com
GOOGLE_REDIRECT_URI=https://[YOUR-BACKEND].onrender.com/api/auth/google/callback
```

---

### 2️⃣ Update Vercel Frontend (2 minutes)

After backend deploys, go to Vercel → Your Project → Settings → Environment Variables

**Add these 2 variables:**
```env
VITE_API_URL=https://[YOUR-BACKEND].onrender.com
VITE_GOOGLE_CLIENT_ID=91377509780-5ku8nd5nk20fegn3s9fko3junf88d5tq.apps.googleusercontent.com
```

Then: Deployments → ⋯ → Redeploy

---

### 3️⃣ Update Google OAuth (2 minutes)

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**Add to Authorized redirect URIs:**
```
https://[YOUR-BACKEND].onrender.com/api/auth/google/callback
```

**Add to Authorized JavaScript origins:**
```
https://budget-calculation.vercel.app
https://[YOUR-BACKEND].onrender.com
```

---

## ✅ Testing After Deployment

1. Visit: https://budget-calculation.vercel.app
2. Click "Sign in with Google"
3. Authorize the app
4. Should redirect to dashboard
5. Create a transaction to test full functionality

---

## 🔧 Your Current Backend .env (Local Development)

Your local `.env` files are already configured:
- ✅ Frontend URL points to Vercel
- ✅ Google OAuth credentials included
- ✅ MongoDB connection ready

For local development, temporarily change FRONTEND_URL back to `http://localhost:5173`

---

## 📱 MongoDB Atlas - Verify IP Whitelist

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Network Access
3. Ensure `0.0.0.0/0` is in the whitelist (allows Render to connect)

---

## 💡 Pro Tips

- **Backend takes 30-60s to wake** (free tier sleeps after 15 min)
- **Upgrade to $7/month** for instant response times
- **Monitor logs** in Render dashboard for errors
- **Keep secrets secure** - never commit .env files

---

## 🆘 Common Issues

**Issue**: CORS error
**Fix**: Ensure FRONTEND_URL in Render = `https://budget-calculation.vercel.app` (no trailing slash)

**Issue**: Google OAuth fails
**Fix**: Update redirect URI in Google Console with exact backend URL

**Issue**: Can't connect to MongoDB
**Fix**: Add `0.0.0.0/0` to MongoDB IP whitelist

---

## 📋 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend on Render with all env vars
- [ ] Copy backend URL after deployment
- [ ] Update BETTER_AUTH_URL in Render
- [ ] Update GOOGLE_REDIRECT_URI in Render
- [ ] Add VITE_API_URL to Vercel
- [ ] Add VITE_GOOGLE_CLIENT_ID to Vercel
- [ ] Redeploy Vercel frontend
- [ ] Update Google OAuth redirect URIs
- [ ] Test login at https://budget-calculation.vercel.app
- [ ] Create test transaction
- [ ] Verify data persists

---

## 🎉 You're Almost There!

Your frontend is live on Vercel. Just deploy the backend to Render and connect them together!

**Time to complete**: ~15 minutes

See detailed guide: [VERCEL_RENDER_DEPLOYMENT.md](VERCEL_RENDER_DEPLOYMENT.md)
