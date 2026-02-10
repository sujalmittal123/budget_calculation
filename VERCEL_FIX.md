# Vercel Deployment Fix - 404 NOT_FOUND Error

## 🔥 The Problem

Getting this error on Vercel:
```
404: NOT_FOUND
Code: NOT_FOUND
ID: bom1::hf68c-1770644074709-30a31bef2748
```

This means Vercel can't find your deployment or the root directory is misconfigured.

## ✅ Solution - Two Options

### Option 1: Deploy Frontend Only (Recommended for Vercel)

Since you have a monorepo with `backend/` and `frontend/`, Vercel needs to know which folder to deploy.

#### Step 1: Check Your Project Structure
```
Budget_calulation/
├── backend/          ← Backend (deploy to Render)
├── frontend/         ← Frontend (deploy to Vercel)
│   ├── src/
│   ├── public/
│   │   └── _redirects
│   ├── vercel.json
│   ├── package.json
│   └── index.html
└── render.yaml
```

#### Step 2: Configure Vercel Project Settings

Go to your Vercel project settings:

**Project Settings > General**:
- **Root Directory**: `frontend` ← CRITICAL!
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `dist` (or leave default)
- **Install Command**: `npm install` (or leave default)

#### Step 3: Set Environment Variables

**Project Settings > Environment Variables**:
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click the three dots (**···**) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

---

### Option 2: Deploy Using Vercel CLI

If the dashboard method doesn't work, use CLI:

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy from Frontend Directory
```bash
cd /home/sujal/practice/Budget_calulation/frontend
vercel --prod
```

When prompted:
- **Set up and deploy**: Yes
- **Which scope**: Select your account
- **Link to existing project**: Yes (if you already created one) / No (if new)
- **What's your project's name**: budget-tracker-frontend
- **In which directory is your code located**: `./` (current directory)
- **Want to override the settings**: No

#### Step 4: Set Environment Variables (CLI)
```bash
vercel env add VITE_API_URL production
# When prompted, enter: https://your-backend.onrender.com/api

vercel env add VITE_GOOGLE_CLIENT_ID production
# When prompted, enter: your-google-client-id
```

#### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

---

## 🔍 Verification Steps

### 1. Check Vercel Dashboard

Go to your project in Vercel Dashboard:

**Deployments Tab**:
- Check if deployment succeeded (green checkmark)
- Click on the deployment to see logs
- Look for any errors in the build logs

**Project Settings Tab**:
- Verify **Root Directory** is set to `frontend`
- Verify **Framework Preset** is Vite
- Verify **Output Directory** is `dist`

### 2. Check Build Logs

If deployment failed:
1. Click on the failed deployment
2. Look at the **Build Logs**
3. Common issues:
   - "Cannot find module" → Missing dependencies
   - "Command not found" → Wrong build command
   - "No such file or directory" → Wrong root directory

### 3. Test Locally

Before deploying, test the build locally:
```bash
cd /home/sujal/practice/Budget_calulation/frontend
npm install
npm run build
npx serve dist
```

Visit `http://localhost:3000` and test:
- Landing page loads
- Can navigate to `/app/dashboard`
- Page refresh works (no 404)

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot find package.json"

**Cause**: Root directory not set correctly

**Fix**:
1. Go to Vercel Project Settings → General
2. Set **Root Directory** to `frontend`
3. Save and redeploy

---

### Issue 2: "Build Command Failed"

**Cause**: Wrong build command or missing dependencies

**Fix**:
```bash
# Test locally first
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

If local build works, check Vercel settings:
- Build Command: `npm run build`
- Install Command: `npm install`

---

### Issue 3: "Output Directory Not Found"

**Cause**: Build succeeded but Vercel can't find the output

**Fix**:
1. Check `vite.config.js`:
   ```javascript
   build: {
     outDir: 'dist',  // ← Should be 'dist'
   }
   ```

2. In Vercel Project Settings:
   - Output Directory: `dist`

---

### Issue 4: Environment Variables Not Working

**Cause**: Variables not prefixed with `VITE_`

**Fix**:
In Vercel, all environment variables for Vite must start with `VITE_`:
```
✅ VITE_API_URL
✅ VITE_GOOGLE_CLIENT_ID
❌ API_URL
❌ GOOGLE_CLIENT_ID
```

Also check in your code (`src/services/api.js`):
```javascript
const baseURL = import.meta.env.VITE_API_URL || '/api';
```

---

### Issue 5: 404 on Routes After Deployment

**Cause**: SPA routing not configured (even though we added `vercel.json`)

**Fix**: Ensure `vercel.json` is in the `frontend/` directory:
```bash
ls /home/sujal/practice/Budget_calulation/frontend/vercel.json
# Should exist
```

If missing, the file is already created. Just commit and push:
```bash
git add frontend/vercel.json
git commit -m "fix: Add vercel.json for SPA routing"
git push
```

---

## 🚀 Step-by-Step Fix for Your Current Issue

Based on the error `404: NOT_FOUND`, here's what to do RIGHT NOW:

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Find your budget-tracker project
3. Click on it

### Step 2: Check/Update Root Directory
1. Go to **Settings** tab
2. Scroll to **Root Directory**
3. If it's empty or wrong, change it to: `frontend`
4. Click **Save**

### Step 3: Redeploy
1. Go back to **Deployments** tab
2. Click the three dots (**···**) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 4: Test
Once deployed, test your URL:
- `https://your-app.vercel.app/` → Should show landing page
- `https://your-app.vercel.app/app/dashboard` → Should show dashboard (after login)

---

## 📊 Expected Vercel Configuration

Here's what your Vercel project settings should look like:

```
┌─────────────────────────────────────────────┐
│ Project Settings                             │
├─────────────────────────────────────────────┤
│ Framework Preset: Vite                      │
│ Root Directory: frontend                     │
│ Build Command: npm run build                │
│ Output Directory: dist                       │
│ Install Command: npm install                │
│                                              │
│ Environment Variables:                       │
│ • VITE_API_URL (Production)                 │
│ • VITE_GOOGLE_CLIENT_ID (Production)        │
└─────────────────────────────────────────────┘
```

---

## 🎯 Quick Checklist

Before deploying to Vercel, verify:

- ✅ Project structure has `frontend/` directory
- ✅ `frontend/package.json` exists with `"scripts": { "build": "vite build" }`
- ✅ `frontend/vercel.json` exists (created earlier)
- ✅ `frontend/public/_redirects` exists (created earlier)
- ✅ Vercel Root Directory set to `frontend`
- ✅ Environment variables set with `VITE_` prefix
- ✅ Local build works: `cd frontend && npm run build`

---

## 💡 Alternative: Deploy Frontend Folder Separately

If you continue having issues, you can separate the frontend:

```bash
# Create a new repository for frontend only
cd /home/sujal/practice/Budget_calulation/frontend
git init
git add .
git commit -m "Initial commit - frontend only"
git remote add origin https://github.com/yourusername/budget-tracker-frontend.git
git push -u origin main
```

Then deploy this new repo to Vercel (without needing to set Root Directory).

---

## 📞 Still Not Working?

If you're still getting the `404: NOT_FOUND` error after following these steps:

1. **Check the exact error in Vercel logs**:
   - Go to deployment → Function Logs
   - Look for specific error messages

2. **Share the build logs**:
   - Go to deployment → Build Logs
   - Copy any error messages

3. **Verify the URL**:
   - Make sure you're accessing the correct Vercel URL
   - Check if you have multiple deployments

4. **Try deploying a simple test**:
   ```bash
   cd frontend
   echo '<!DOCTYPE html><html><body><h1>Test</h1></body></html>' > test.html
   vercel --prod
   ```
   If this works, the issue is with your build configuration.

---

**Last Updated**: February 9, 2026
