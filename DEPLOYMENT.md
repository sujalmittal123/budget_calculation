# Budget Tracker - Deployment Guide

This guide will help you deploy your Budget Tracker application to Vercel (Frontend) and Render (Backend).

## 📋 Prerequisites

- MongoDB Atlas account (for database)
- Vercel account (for frontend hosting)
- Render account (for backend hosting)
- Google OAuth credentials (from Google Cloud Console)

---

## 🗄️ Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (note username and password)
4. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/budget-tracker?retryWrites=true&w=majority`

---

## 🔑 Step 2: Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Create OAuth Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for local dev)
     - `https://your-backend-url.onrender.com/api/auth/google/callback` (for production)
     - `https://your-frontend-url.vercel.app` (for production)
7. Save your Client ID and Client Secret

---

## 🚀 Step 3: Deploy Backend to Render

### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `budget-tracker-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. Add Environment Variables (click "Advanced" → "Add Environment Variable"):

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
SESSION_SECRET=<generate-a-random-secret-key>
BETTER_AUTH_SECRET=<generate-another-random-secret-key>
BETTER_AUTH_URL=https://your-backend-url.onrender.com
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
GOOGLE_REDIRECT_URI=https://your-backend-url.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-url.vercel.app
```

7. Click "Create Web Service"
8. Wait for deployment to complete
9. Copy your backend URL (e.g., `https://budget-tracker-backend-xxxx.onrender.com`)

### Generate Random Secrets

Use this command to generate secure random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎨 Step 4: Deploy Frontend to Vercel

### Option A: Deploy from GitHub (Recommended)

1. Push your code to GitHub (if not already done)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
   - Click "Environment Variables"
   - Add these variables:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

7. Click "Deploy"
8. Wait for deployment to complete
9. Copy your frontend URL (e.g., `https://budget-tracker.vercel.app`)

### Option B: Deploy using Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

When prompted:
- Set up and deploy: Yes
- Which scope: Your account
- Link to existing project: No
- Project name: budget-tracker-frontend
- Directory: ./
- Override settings: No

Then set environment variables:
```bash
vercel env add VITE_API_URL
vercel env add VITE_GOOGLE_CLIENT_ID
```

---

## 🔄 Step 5: Update Backend Environment Variables

Now that you have your frontend URL, update these backend environment variables in Render:

1. Go to your backend service in Render Dashboard
2. Click "Environment" tab
3. Update these variables:
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `GOOGLE_REDIRECT_URI`: Update if needed

4. Save changes (this will redeploy your backend)

---

## 🔄 Step 6: Update Google OAuth Redirect URIs

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "Credentials"
3. Click on your OAuth Client ID
4. Add these Authorized redirect URIs:
   - `https://your-backend-url.onrender.com/api/auth/google/callback`
   - `https://your-frontend-url.vercel.app`
   - `https://your-frontend-url.vercel.app/auth/callback`
5. Add Authorized JavaScript origins:
   - `https://your-frontend-url.vercel.app`
6. Save changes

---

## ✅ Step 7: Verify Deployment

1. Visit your frontend URL: `https://your-frontend-url.vercel.app`
2. Check that the landing page loads correctly
3. Click "Get Started" or "Login"
4. Test Google OAuth login
5. Verify all pages work:
   - Dashboard: `/app/dashboard`
   - Transactions: `/app/transactions`
   - Bank Accounts: `/app/bank-accounts`
   - Reports: `/app/reports`
   - Daily Notes: `/app/daily-notes`
   - Recurring: `/app/recurring`
   - Settings: `/app/settings`

---

## 🐛 Troubleshooting

### Issue: 404 Error on Page Refresh

**Cause**: Single Page Application (SPA) routing not configured properly.

**Solution**: This has been fixed! The following files handle SPA routing:
- `/frontend/vercel.json` - Vercel configuration (already created)
- `/frontend/public/_redirects` - Render/Netlify configuration (already created)
- `/render.yaml` - Render configuration with rewrite rules (already configured)

### Issue: CORS Errors

**Cause**: Backend not allowing requests from frontend domain.

**Solution**: 
1. Check backend `FRONTEND_URL` environment variable in Render
2. Ensure it matches your Vercel frontend URL exactly
3. Check that backend CORS configuration includes credentials: true

### Issue: Google OAuth Not Working

**Cause**: Redirect URIs not properly configured.

**Solution**:
1. Verify `GOOGLE_REDIRECT_URI` in Render backend matches exactly what's in Google Console
2. Ensure both frontend and backend URLs are added to Google OAuth authorized origins
3. Check browser console for specific error messages

### Issue: API Requests Failing

**Cause**: Frontend not connecting to backend.

**Solution**:
1. Check `VITE_API_URL` in Vercel environment variables
2. Verify backend is running (check Render dashboard)
3. Test backend health endpoint: `https://your-backend-url.onrender.com/api/health`
4. Check browser Network tab for actual API calls

### Issue: Sessions Not Persisting

**Cause**: Cookie settings or MongoDB session store not working.

**Solution**:
1. Verify `MONGODB_URI` is correct in Render
2. Check that `SESSION_SECRET` is set
3. Ensure `withCredentials: true` in frontend API config (already set in /frontend/src/services/api.js:21)

---

## 🔒 Security Checklist

- ✅ All sensitive keys in environment variables (not in code)
- ✅ `SESSION_SECRET` and `BETTER_AUTH_SECRET` are random and secure
- ✅ MongoDB connection string uses strong password
- ✅ Google OAuth redirect URIs restricted to your domains only
- ✅ CORS configured to allow only your frontend domain
- ✅ HTTPOnly cookies enabled for session security
- ✅ HTTPS enabled on both frontend and backend

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

**Vercel (Frontend)**:
- Automatically deploys on push to main branch
- Preview deployments for pull requests
- Instant rollbacks available

**Render (Backend)**:
- Automatically deploys on push to main branch
- Manual deploy option available in dashboard
- Can configure deploy hooks for specific branches

---

## 📊 Monitoring

**Render Dashboard**:
- View backend logs
- Monitor resource usage
- Set up health checks

**Vercel Dashboard**:
- View deployment logs
- Monitor function execution
- Analytics and performance metrics

---

## 💰 Cost Estimates

**Free Tier Limits**:
- **Vercel**: 100GB bandwidth, unlimited sites
- **Render**: 750 hours/month, auto-sleep after 15 min inactivity
- **MongoDB Atlas**: 512MB storage, free forever

**Note**: Render free tier services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## 📝 Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<mongodb-atlas-connection-string>
SESSION_SECRET=<random-secret-32-chars>
BETTER_AUTH_SECRET=<random-secret-32-chars>
BETTER_AUTH_URL=https://your-backend.onrender.com
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

---

## 🎉 Success!

Your Budget Tracker app is now live! Share the frontend URL with users.

**Important**: Make sure to test all features after deployment:
- ✅ Google OAuth login
- ✅ Creating transactions
- ✅ Managing bank accounts
- ✅ Viewing reports
- ✅ Daily notes and burn rate
- ✅ Recurring transactions
- ✅ Currency switching
- ✅ Dark mode
- ✅ CSV import/export

---

## 📞 Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend build errors
3. Check browser console for frontend runtime errors
4. Verify all environment variables are set correctly
5. Test backend health endpoint: `/api/health`

---

**Last Updated**: February 9, 2026
**Version**: 1.0.0
