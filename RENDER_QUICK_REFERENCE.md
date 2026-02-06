# 🚀 Render Deployment - Quick Reference

## All Fields You Need to Fill in Render

### 📦 Backend Web Service Configuration

#### Basic Settings:
- **Name**: `budget-tracker-backend`
- **Region**: `Oregon (US West)` or closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` or `Starter ($7/month)`

#### Environment Variables (10 Required):

| Variable Name | Example Value | Where to Get | Mark as Secret? |
|--------------|---------------|--------------|-----------------|
| `NODE_ENV` | `production` | Manual | No |
| `PORT` | `5000` | Auto-set by Render | No |
| `MONGODB_URI` | `mongodb+srv://user:password@cluster.mongodb.net/budget_tracker` | MongoDB Atlas | **YES** |
| `JWT_SECRET` | (64+ random chars) | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | **YES** |
| `SESSION_SECRET` | (64+ random chars) | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | **YES** |
| `JWT_EXPIRE` | `7d` | Manual | No |
| `FRONTEND_URL` | `https://budget-tracker-frontend.onrender.com` | Copy from Render after frontend deploy | No |
| `GOOGLE_CLIENT_ID` | `123456-abc.apps.googleusercontent.com` | Google Cloud Console | No |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxx` | Google Cloud Console | **YES** |
| `GOOGLE_REDIRECT_URI` | `https://budget-tracker-backend.onrender.com/api/auth/google/callback` | Copy from Render after backend deploy | No |

#### Advanced Settings:
- **Health Check Path**: `/api/health`
- **Health Check Grace Period**: `60` seconds

---

### 🎨 Frontend Static Site Configuration

#### Basic Settings:
- **Name**: `budget-tracker-frontend`
- **Region**: `Oregon (US West)` (same as backend)
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

#### Environment Variables (2 Required):

| Variable Name | Example Value | Where to Get |
|--------------|---------------|--------------|
| `VITE_API_URL` | `https://budget-tracker-backend.onrender.com` | Copy from Render after backend deploy |
| `VITE_GOOGLE_CLIENT_ID` | `123456-abc.apps.googleusercontent.com` | Same as backend GOOGLE_CLIENT_ID |

#### Redirects/Rewrites:
Add this rewrite rule for React Router:
- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: `Rewrite`

---

## 📋 Pre-Deployment Checklist

### Before Starting Render Setup:

1. **MongoDB Atlas Setup** ✅
   - [ ] Create free cluster
   - [ ] Create database user
   - [ ] Set IP whitelist to `0.0.0.0/0`
   - [ ] Copy connection string

2. **Google OAuth Setup** ✅
   - [ ] Create project in Google Cloud Console
   - [ ] Enable Google+ API
   - [ ] Create OAuth 2.0 credentials
   - [ ] Copy Client ID
   - [ ] Copy Client Secret
   - [ ] Note: You'll update redirect URIs after Render deployment

3. **Generate Secrets** ✅
   ```bash
   # Run this twice to get JWT_SECRET and SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Push to GitHub** ✅
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

---

## 🎯 Deployment Order

Follow this order to avoid circular dependencies:

1. **Deploy Backend First**
   - Set all environment variables (use temporary values for FRONTEND_URL if needed)
   - Copy the backend URL after deployment

2. **Deploy Frontend Second**
   - Use the backend URL in `VITE_API_URL`
   - Copy the frontend URL after deployment

3. **Update Backend**
   - Update `FRONTEND_URL` with actual frontend URL
   - Trigger manual redeploy

4. **Update Google OAuth**
   - Add actual backend redirect URI to Google Console
   - Format: `https://your-actual-backend.onrender.com/api/auth/google/callback`

---

## 🔗 URLs You'll Need

After deployment, you'll have:
- **Backend URL**: `https://budget-tracker-backend.onrender.com`
- **Frontend URL**: `https://budget-tracker-frontend.onrender.com`
- **Backend Health Check**: `https://budget-tracker-backend.onrender.com/api/health`

---

## 📞 Quick Links

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Google Cloud Console**: https://console.cloud.google.com
- **Render Dashboard**: https://dashboard.render.com
- **Full Deployment Guide**: See `RENDER_DEPLOYMENT_GUIDE.md`

---

## ⚡ Quick Deploy with Blueprint (Recommended)

If you prefer automatic setup:

1. Push to GitHub
2. Go to Render → "New" → "Blueprint"
3. Connect repository
4. Render auto-detects `render.yaml`
5. Click "Apply"
6. Manually set the environment variables listed above for both services
7. Done! 🎉

---

## 🆘 Common First-Time Issues

1. **"Module not found"**: Check Root Directory is set correctly
2. **"Cannot connect to MongoDB"**: Verify IP whitelist is 0.0.0.0/0
3. **"CORS error"**: Ensure FRONTEND_URL has no trailing slash
4. **"Google OAuth fails"**: Update redirect URI in Google Console
5. **"Blank page"**: Add SPA rewrite rule to frontend

---

For detailed troubleshooting, see the full guide: `RENDER_DEPLOYMENT_GUIDE.md`
