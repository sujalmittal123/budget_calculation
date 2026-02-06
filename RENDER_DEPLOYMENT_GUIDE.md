# 🚀 Render Deployment Guide for Budget Tracker

## Prerequisites

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (Render doesn't provide MongoDB)
4. **Google OAuth Credentials**: Set up at [Google Cloud Console](https://console.cloud.google.com)

---

## 📋 Step-by-Step Deployment Process

### 1. Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier is fine)
3. Create a database user:
   - Username: `budget_user` (or any name)
   - Password: Generate a secure password
4. Whitelist IP addresses:
   - Click "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for Render
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `budget_tracker`
   - Example: `mongodb+srv://budget_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/budget_tracker?retryWrites=true&w=majority`

### 2. Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Add authorized redirect URIs:
   - `https://your-backend-app.onrender.com/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (for local testing)
7. Save and note down:
   - **Client ID**
   - **Client Secret**

---

## 🎯 OPTION 1: Deploy Using Render Blueprint (render.yaml) - RECOMMENDED

This method deploys both services automatically from one configuration file.

### Steps:

1. **Push Your Code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file
   - Click "Apply"

3. **Configure Environment Variables**
   
   After blueprint creation, you need to set these variables manually:

   **For Backend Service:**
   - Go to the backend service settings
   - Navigate to "Environment" tab
   - Add these variables:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `MONGODB_URI` | `mongodb+srv://...` | From MongoDB Atlas |
   | `FRONTEND_URL` | `https://budget-tracker-frontend.onrender.com` | Your frontend URL |
   | `GOOGLE_CLIENT_ID` | Your Google Client ID | From Google Console |
   | `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | From Google Console |
   | `GOOGLE_REDIRECT_URI` | `https://budget-tracker-backend.onrender.com/api/auth/google/callback` | Your backend URL + path |

   **For Frontend Service:**
   - Go to the frontend service settings
   - Navigate to "Environment" tab
   - Add these variables:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `VITE_API_URL` | `https://budget-tracker-backend.onrender.com` | Your backend URL |
   | `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID | Same as backend |

4. **Update Google OAuth Redirect URIs**
   - Go back to Google Cloud Console
   - Update the redirect URI with your actual Render backend URL
   - Save changes

5. **Trigger Redeploy**
   - Click "Manual Deploy" → "Deploy latest commit" for both services

---

## 🎯 OPTION 2: Manual Deployment (Individual Services)

### Deploy Backend:

1. **Create New Web Service**
   - Go to Render Dashboard → "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:

   | Field | Value |
   |-------|-------|
   | **Name** | `budget-tracker-backend` |
   | **Region** | `Oregon (US West)` or closest to you |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` (or paid for better performance) |

2. **Advanced Settings - Environment Variables**

   Click "Advanced" and add these environment variables:

   | Key | Value | Secret? |
   |-----|-------|---------|
   | `NODE_ENV` | `production` | No |
   | `PORT` | `5000` | No |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/budget_tracker` | Yes |
   | `JWT_SECRET` | Generate random 64+ character string | Yes |
   | `SESSION_SECRET` | Generate random 64+ character string | Yes |
   | `JWT_EXPIRE` | `7d` | No |
   | `FRONTEND_URL` | `https://budget-tracker-frontend.onrender.com` | No |
   | `GOOGLE_CLIENT_ID` | Your Google Client ID | No |
   | `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | Yes |
   | `GOOGLE_REDIRECT_URI` | `https://budget-tracker-backend.onrender.com/api/auth/google/callback` | No |

   **To generate secure secrets:**
   ```bash
   # In terminal
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Health Check Path** (in Advanced)
   - Path: `/api/health`
   - Grace period: `60` seconds

4. Click **"Create Web Service"**

### Deploy Frontend:

1. **Create New Static Site**
   - Go to Render Dashboard → "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:

   | Field | Value |
   |-------|-------|
   | **Name** | `budget-tracker-frontend` |
   | **Region** | `Oregon (US West)` or same as backend |
   | **Branch** | `main` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `dist` |

2. **Environment Variables**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://budget-tracker-backend.onrender.com` |
   | `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID (same as backend) |

3. **Redirects/Rewrites** (for SPA routing)
   - Add a rewrite rule:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`

4. Click **"Create Static Site"**

---

## 📝 Complete Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Example/Description | Where to Get |
|----------|----------|---------------------|--------------|
| `NODE_ENV` | Yes | `production` | Set manually |
| `PORT` | No | `5000` (Render auto-sets PORT) | Auto-provided |
| `MONGODB_URI` | Yes | `mongodb+srv://...` | MongoDB Atlas |
| `JWT_SECRET` | Yes | Random 64+ char string | Generate with crypto |
| `SESSION_SECRET` | Yes | Random 64+ char string | Generate with crypto |
| `JWT_EXPIRE` | Yes | `7d` | Set manually |
| `FRONTEND_URL` | Yes | `https://your-frontend.onrender.com` | From Render frontend URL |
| `GOOGLE_CLIENT_ID` | Yes | `123456-abc.apps.googleusercontent.com` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | `GOCSPX-...` | Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | Yes | `https://your-backend.onrender.com/api/auth/google/callback` | From Render backend URL |

### Frontend Environment Variables

| Variable | Required | Example/Description | Where to Get |
|----------|----------|---------------------|--------------|
| `VITE_API_URL` | Yes | `https://your-backend.onrender.com` | From Render backend URL |
| `VITE_GOOGLE_CLIENT_ID` | Yes | `123456-abc.apps.googleusercontent.com` | Google Cloud Console (same as backend) |

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Origins
The backend is already configured to use `FRONTEND_URL` for CORS, so no code changes needed.

### 2. Update Google OAuth Redirect URIs
1. Go to Google Cloud Console
2. Navigate to your OAuth 2.0 Client
3. Update Authorized redirect URIs:
   - Add: `https://your-actual-backend-url.onrender.com/api/auth/google/callback`
4. Save

### 3. Test the Deployment
1. Visit your frontend URL: `https://budget-tracker-frontend.onrender.com`
2. Try logging in with Google
3. Check backend health: `https://budget-tracker-backend.onrender.com/api/health`
4. Monitor logs in Render dashboard if issues occur

---

## 🐛 Common Issues & Solutions

### Issue 1: "Origin not allowed by Access-Control-Allow-Origin"
**Solution**: Ensure `FRONTEND_URL` is set correctly in backend environment variables (no trailing slash).

### Issue 2: "Cannot connect to MongoDB"
**Solution**: 
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check `MONGODB_URI` connection string is correct
- Ensure database user has read/write permissions

### Issue 3: "Session not persisting / Cookies not working"
**Solution**:
- Ensure `SESSION_SECRET` is set
- Check that both services are deployed on HTTPS
- Verify `withCredentials: true` in frontend API calls (already configured)

### Issue 4: "Google OAuth redirect fails"
**Solution**:
- Verify `GOOGLE_REDIRECT_URI` matches exactly with Google Console settings
- Check `GOOGLE_CLIENT_SECRET` is correct
- Ensure Google OAuth consent screen is configured

### Issue 5: Backend crashes on startup
**Solution**:
- Check Render logs for specific error
- Most common: Missing environment variables
- Verify all required env vars are set

### Issue 6: Frontend shows blank page
**Solution**:
- Check that rewrites/redirects are configured for SPA routing
- Verify build completed successfully in logs
- Check `VITE_API_URL` is set correctly

---

## 📊 Monitoring & Maintenance

### View Logs
- Go to your service in Render Dashboard
- Click "Logs" tab
- Monitor real-time application logs

### View Metrics
- CPU usage
- Memory usage
- Request counts
- Response times

### Auto-Deploy
Render automatically deploys when you push to your GitHub branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deploy
- Go to service settings
- Click "Manual Deploy" → "Deploy latest commit"

---

## 💰 Cost Estimation

### Free Tier (Good for testing):
- **Backend Web Service**: Free (sleeps after 15min inactivity)
- **Frontend Static Site**: Free
- **MongoDB Atlas**: Free (M0 cluster, 512MB storage)
- **Total**: $0/month

### Paid Tier (Production ready):
- **Backend Web Service**: $7/month (Starter)
- **Frontend Static Site**: Free
- **MongoDB Atlas**: $0-$57/month depending on usage
- **Total**: $7-64/month

---

## 🔒 Security Best Practices

1. ✅ **Never commit .env files** to Git
2. ✅ **Use strong secrets** (64+ characters)
3. ✅ **Enable HTTPS** (Render does this automatically)
4. ✅ **Whitelist specific origins** in CORS (already configured with FRONTEND_URL)
5. ✅ **Use environment-specific configs** (production vs development)
6. ✅ **Regular dependency updates**: `npm audit fix`
7. ✅ **Monitor logs** for suspicious activity

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] MongoDB connection string obtained
- [ ] Google OAuth credentials created
- [ ] Backend service created on Render
- [ ] All backend environment variables set
- [ ] Frontend static site created on Render
- [ ] All frontend environment variables set
- [ ] Google OAuth redirect URIs updated with Render URLs
- [ ] SPA rewrites configured for frontend
- [ ] Both services deployed successfully
- [ ] Health check endpoint working
- [ ] Google login tested
- [ ] Create test transaction to verify full functionality

---

## 🎉 Success!

Your Budget Tracker app should now be live! Share your deployed URLs:
- Frontend: `https://budget-tracker-frontend.onrender.com`
- Backend: `https://budget-tracker-backend.onrender.com`

Remember: Free tier services sleep after 15 minutes of inactivity. First request after sleep may take 30-60 seconds to wake up.
