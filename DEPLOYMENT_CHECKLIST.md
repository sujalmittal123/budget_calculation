# ✅ Render Deployment Checklist

Print this and check off each item as you complete it!

---

## 🗂️ PRE-DEPLOYMENT (Do First)

### MongoDB Atlas Setup
- [ ] Created account at mongodb.com/cloud/atlas
- [ ] Created new cluster (M0 Free tier is fine)
- [ ] Created database user with strong password
- [ ] Saved username: _______________
- [ ] Saved password: _______________
- [ ] Set Network Access IP whitelist to `0.0.0.0/0`
- [ ] Copied connection string
- [ ] Replaced `<password>` in connection string
- [ ] Replaced `<dbname>` with `budget_tracker`
- [ ] Final MONGODB_URI: _______________________________________________

### Google OAuth Setup
- [ ] Created/selected project in console.cloud.google.com
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Client ID
- [ ] Selected "Web application" type
- [ ] Copied Client ID: _______________________________________________
- [ ] Copied Client Secret: __________________________________________
- [ ] Note: Will update redirect URIs after Render deployment

### Generate Secrets
Run this command twice to generate two different secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- [ ] JWT_SECRET generated: ___________________________________________
- [ ] SESSION_SECRET generated: _______________________________________

### GitHub Repository
- [ ] Code committed: `git add . && git commit -m "Ready for deployment"`
- [ ] Code pushed: `git push origin main`
- [ ] Repository URL: _________________________________________________

---

## 🚀 RENDER DEPLOYMENT

### Step 1: Deploy Backend Web Service

#### Basic Configuration
- [ ] Logged into dashboard.render.com
- [ ] Clicked "New" → "Web Service"
- [ ] Connected GitHub repository
- [ ] Name: `budget-tracker-backend`
- [ ] Region: Selected closest region
- [ ] Branch: `main`
- [ ] Root Directory: `backend`
- [ ] Runtime: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Instance Type: Selected Free or Starter

#### Advanced - Health Check
- [ ] Health Check Path: `/api/health`
- [ ] Health Check Grace Period: `60` seconds

#### Environment Variables (Click "Add Environment Variable" for each)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGODB_URI` = (paste your MongoDB connection string)
- [ ] `JWT_SECRET` = (paste generated secret)
- [ ] `SESSION_SECRET` = (paste generated secret)
- [ ] `JWT_EXPIRE` = `7d`
- [ ] `FRONTEND_URL` = `https://budget-tracker-frontend.onrender.com` (temporary)
- [ ] `GOOGLE_CLIENT_ID` = (paste Google Client ID)
- [ ] `GOOGLE_CLIENT_SECRET` = (paste Google Client Secret) **Mark as Secret!**
- [ ] `GOOGLE_REDIRECT_URI` = `https://budget-tracker-backend.onrender.com/api/auth/google/callback` (temporary)

#### Deploy Backend
- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment to complete (5-10 minutes)
- [ ] Backend deployed successfully ✅
- [ ] Copied actual backend URL: __________________________________________
- [ ] Tested health check: `https://YOUR-BACKEND-URL/api/health` returns OK

---

### Step 2: Deploy Frontend Static Site

#### Basic Configuration
- [ ] Clicked "New" → "Static Site"
- [ ] Connected same GitHub repository
- [ ] Name: `budget-tracker-frontend`
- [ ] Region: Same as backend
- [ ] Branch: `main`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`

#### Environment Variables
- [ ] `VITE_API_URL` = (paste actual backend URL from Step 1)
- [ ] `VITE_GOOGLE_CLIENT_ID` = (paste same Google Client ID as backend)

#### Redirects/Rewrites (for React Router)
- [ ] Added rewrite rule:
  - Source: `/*`
  - Destination: `/index.html`
  - Action: `Rewrite`

#### Deploy Frontend
- [ ] Clicked "Create Static Site"
- [ ] Waited for deployment to complete (3-5 minutes)
- [ ] Frontend deployed successfully ✅
- [ ] Copied actual frontend URL: __________________________________________
- [ ] Visited frontend URL and confirmed it loads

---

### Step 3: Update Backend Environment Variables

- [ ] Went back to Backend service settings
- [ ] Clicked "Environment" tab
- [ ] Updated `FRONTEND_URL` with actual frontend URL (no trailing slash)
- [ ] Updated `GOOGLE_REDIRECT_URI` with actual backend URL
- [ ] Final GOOGLE_REDIRECT_URI: _______________________________________
- [ ] Clicked "Save Changes"
- [ ] Triggered manual redeploy: "Manual Deploy" → "Deploy latest commit"

---

### Step 4: Update Google OAuth Settings

- [ ] Went to console.cloud.google.com
- [ ] Selected correct project
- [ ] Went to "Credentials"
- [ ] Clicked on OAuth 2.0 Client ID
- [ ] Added Authorized redirect URI: (actual backend URL + `/api/auth/google/callback`)
- [ ] Example: `https://budget-tracker-backend-abc123.onrender.com/api/auth/google/callback`
- [ ] Saved changes

---

## 🧪 TESTING

### Backend Tests
- [ ] Health check works: `https://YOUR-BACKEND-URL/api/health`
- [ ] Returns: `{"status":"ok","message":"Budget Tracker API is running"}`

### Frontend Tests
- [ ] Frontend loads: `https://YOUR-FRONTEND-URL`
- [ ] Landing page appears
- [ ] Click "Sign in with Google"
- [ ] Google OAuth popup appears
- [ ] After selecting Google account, redirected back to app
- [ ] Logged in successfully
- [ ] Dashboard loads

### Full Functionality Tests
- [ ] Create a bank account
- [ ] Add a transaction
- [ ] View transactions list
- [ ] Check dashboard updates
- [ ] Log out
- [ ] Log back in
- [ ] Data persists

---

## 📝 SAVE YOUR DEPLOYMENT INFO

**Production URLs:**
- Frontend: ___________________________________________________________
- Backend: ____________________________________________________________
- Health Check: _______________________________________________________

**MongoDB:**
- Connection String: __________________________________________________

**Google OAuth:**
- Client ID: __________________________________________________________
- Redirect URI: _______________________________________________________

**Generated Secrets:**
- JWT_SECRET: (keep secure, don't write here)
- SESSION_SECRET: (keep secure, don't write here)

---

## 🎉 DEPLOYMENT COMPLETE!

- [ ] All tests passed
- [ ] Saved deployment info
- [ ] Shared app URL with team/users

**Free Tier Note:** Your backend will sleep after 15 minutes of inactivity. First request after sleep will take 30-60 seconds. Upgrade to paid tier for 24/7 uptime.

---

## 🆘 TROUBLESHOOTING

If you encounter issues:

1. **Check Render Logs:**
   - Go to service → "Logs" tab
   - Look for error messages

2. **Common Issues:**
   - CORS error → Check FRONTEND_URL has no trailing slash
   - MongoDB connection error → Verify IP whitelist is 0.0.0.0/0
   - Google OAuth fails → Check redirect URI matches exactly
   - Blank page → Verify SPA rewrite rule is added

3. **Get Help:**
   - See RENDER_DEPLOYMENT_GUIDE.md for detailed troubleshooting
   - Check Render community forums
   - Review MongoDB Atlas connection docs

---

**Deployment Date:** __________________
**Deployed By:** ______________________
**Notes:** 
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
