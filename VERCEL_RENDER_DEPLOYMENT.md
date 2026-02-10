# 🚀 Vercel + Render Deployment Guide

Your app uses a hybrid deployment:
- **Frontend**: Vercel → `https://budget-calculation.vercel.app`
- **Backend**: Render (to be deployed)

---

## 📋 Current Configuration

### Frontend (Vercel) ✅
- **URL**: https://budget-calculation.vercel.app
- **Status**: Already deployed
- **Platform**: Vercel

### Backend (Render) 🔄
- **Status**: Needs deployment
- **Platform**: Render
- **Required**: Backend API for the frontend to connect to

---

## 🎯 Complete Deployment Steps

### 1. Deploy Backend to Render

Since your frontend is already on Vercel, you need to deploy the backend:

#### Render Backend Configuration:

**Basic Settings:**
- Name: `budget-tracker-backend`
- Region: Choose closest to you
- Branch: `main`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

**Environment Variables (Required):**

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://budgetapp:RE7wnpkROoptsYxK@cluster0.flc6kb4.mongodb.net/budget-tracker?retryWrites=true&w=majority` |
| `SESSION_SECRET` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2` |
| `BETTER_AUTH_SECRET` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2` |
| `BETTER_AUTH_URL` | `https://your-backend.onrender.com` (update after deployment) |
| `FRONTEND_URL` | `https://budget-calculation.vercel.app` |
| `APP_URL` | `https://budget-calculation.vercel.app` |
| `GOOGLE_CLIENT_ID` | `91377509780-5ku8nd5nk20fegn3s9fko3junf88d5tq.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |
| `GOOGLE_REDIRECT_URI` | `https://your-backend.onrender.com/api/auth/google/callback` |

---

### 2. Update Vercel Frontend Environment Variables

Once your backend is deployed on Render, update Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render backend URL (e.g., `https://budget-tracker-backend.onrender.com`) |
| `VITE_GOOGLE_CLIENT_ID` | `91377509780-5ku8nd5nk20fegn3s9fko3junf88d5tq.apps.googleusercontent.com` |

3. Redeploy frontend: Deployments → Click ⋯ → Redeploy

---

### 3. Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to Credentials → OAuth 2.0 Client IDs
4. Update Authorized redirect URIs to include:
   - `https://your-backend.onrender.com/api/auth/google/callback`
   - Keep: `http://localhost:5000/api/auth/google/callback` (for local dev)
5. Update Authorized JavaScript origins:
   - `https://budget-calculation.vercel.app`
   - `https://your-backend.onrender.com`
6. Save changes

---

## 🔗 Final URLs Setup

After backend deployment, you'll have:

| Service | URL |
|---------|-----|
| Frontend | https://budget-calculation.vercel.app |
| Backend | https://[your-backend].onrender.com |
| API Health | https://[your-backend].onrender.com/api/health |

---

## ⚙️ Configuration Files Updated

The following files have been updated with your Vercel URL:

1. ✅ **backend/.env** - FRONTEND_URL and APP_URL set to `https://budget-calculation.vercel.app`
2. ✅ **frontend/.env** - Ready for backend URL (update VITE_API_URL after backend deployment)

---

## 🚀 Quick Deploy Backend on Render

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update for Vercel + Render deployment"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - New → Web Service
   - Connect your repo
   - Use settings from section 1 above
   - Add all environment variables
   - Click "Create Web Service"

3. **After Backend Deploys:**
   - Copy backend URL
   - Update BETTER_AUTH_URL in Render backend env vars
   - Update GOOGLE_REDIRECT_URI in Render backend env vars
   - Add VITE_API_URL in Vercel frontend settings
   - Redeploy both services

---

## 🧪 Testing Checklist

After both services are deployed:

- [ ] Frontend loads: https://budget-calculation.vercel.app
- [ ] Backend health check: https://[backend].onrender.com/api/health
- [ ] Google OAuth login works
- [ ] Can create bank accounts
- [ ] Can add transactions
- [ ] Dashboard displays data
- [ ] Data persists after logout/login

---

## 📝 MongoDB Atlas Setup (If Not Done)

Your MongoDB connection is already configured. Verify:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to Network Access
3. Ensure IP whitelist includes `0.0.0.0/0` (to allow Render access)
4. Database user `budgetapp` has read/write permissions

---

## 🎉 Benefits of This Setup

✅ **Frontend (Vercel)**: Fast global CDN, automatic HTTPS, instant deployments
✅ **Backend (Render)**: Free tier available, automatic HTTPS, easy deployment
✅ **MongoDB (Atlas)**: Managed database, free tier available

---

## 💡 Important Notes

1. **Free Tier Limitations:**
   - Render free tier sleeps after 15 min inactivity (30-60s wake time)
   - Consider upgrading to Render Starter ($7/month) for 24/7 uptime

2. **CORS Configuration:**
   - Backend CORS is configured to accept requests from your Vercel domain
   - Cookies work across domains with `withCredentials: true`

3. **Environment Variables:**
   - Never commit .env files to GitHub
   - Keep secrets secure in platform dashboards
   - Update both platforms when URLs change

---

## 🆘 Need Help?

- **Render Issues**: See [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)
- **Vercel Issues**: Check Vercel deployment logs in dashboard
- **MongoDB Issues**: Verify connection string and IP whitelist

---

## 📞 Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://cloud.mongodb.com
- Google Console: https://console.cloud.google.com

Your frontend is ready! Now deploy the backend to complete the setup. 🚀
