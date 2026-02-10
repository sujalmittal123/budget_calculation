# 📋 RENDER ENVIRONMENT VARIABLES - COPY & PASTE

Use these exact values when setting up your backend on Render.

---

## Environment Variables to Add

### Variable 1
**Key**: `NODE_ENV`
**Value**:
```
production
```

### Variable 2
**Key**: `PORT`
**Value**:
```
5000
```

### Variable 3
**Key**: `MONGODB_URI`
**Value**:
```
mongodb+srv://budgetapp:RE7wnpkROoptsYxK@cluster0.flc6kb4.mongodb.net/budget-tracker?retryWrites=true&w=majority
```
☑️ Mark as secret

### Variable 4
**Key**: `SESSION_SECRET`
**Value**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```
☑️ Mark as secret

### Variable 5
**Key**: `BETTER_AUTH_SECRET`
**Value**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```
☑️ Mark as secret

### Variable 6
**Key**: `FRONTEND_URL`
**Value**:
```
https://budget-calculation.vercel.app
```

### Variable 7
**Key**: `APP_URL`
**Value**:
```
https://budget-calculation.vercel.app
```

### Variable 8
**Key**: `GOOGLE_CLIENT_ID`
**Value**:
```
91377509780-5ku8nd5nk20fegn3s9fko3junf88d5tq.apps.googleusercontent.com
```

### Variable 9
**Key**: `GOOGLE_CLIENT_SECRET`
**Value**:
```
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
```
☑️ Mark as secret

---

## ⚠️ ADD AFTER BACKEND DEPLOYS

Once your backend is deployed and you have the URL, add these two:

### Variable 10
**Key**: `BETTER_AUTH_URL`
**Value**: Replace [YOUR-BACKEND-URL] with your actual Render URL
```
https://[YOUR-BACKEND-URL].onrender.com
```

Example: `https://budget-tracker-backend-abc123.onrender.com`

### Variable 11
**Key**: `GOOGLE_REDIRECT_URI`
**Value**: Replace [YOUR-BACKEND-URL] with your actual Render URL
```
https://[YOUR-BACKEND-URL].onrender.com/api/auth/google/callback
```

Example: `https://budget-tracker-backend-abc123.onrender.com/api/auth/google/callback`

---

## 🔄 After Adding Variables

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL from Render
4. Go back to Environment tab
5. Add variables 10 & 11 with your actual URL
6. Click "Save Changes"
7. Render will automatically redeploy

---

## 📝 Vercel Variables (Add After Backend Deploys)

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

### Vercel Variable 1
**Key**: `VITE_API_URL`
**Value**: Your Render backend URL
```
https://[YOUR-BACKEND-URL].onrender.com
```

### Vercel Variable 2
**Key**: `VITE_GOOGLE_CLIENT_ID`
**Value**:
```
91377509780-5ku8nd5nk20fegn3s9fko3junf88d5tq.apps.googleusercontent.com
```

Then: Deployments → Click ⋯ → Redeploy

---

## ✅ All Set!

Follow these steps in order:
1. ✅ Add variables 1-9 to Render
2. ✅ Deploy backend
3. ✅ Copy backend URL
4. ✅ Add variables 10-11 to Render (with your URL)
5. ✅ Add 2 variables to Vercel
6. ✅ Redeploy Vercel
7. ✅ Update Google OAuth settings
8. ✅ Test at https://budget-calculation.vercel.app

Done! 🎉
