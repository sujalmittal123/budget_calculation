# Budget Tracker - Authentication Migration Complete! 🎉

## What Changed?

Your Budget Tracker now has **enterprise-grade authentication** powered by Better-Auth!

### Old System ❌
- JWT tokens in localStorage (vulnerable to XSS)
- Email/password authentication with weak security
- Manual Google OAuth integration
- No session management
- 7-day tokens with no refresh

### New System ✅
- **HTTPOnly cookies** (XSS protected)
- **Google OAuth only** (simplified, secure)
- **Better-Auth** (industry-standard auth library)
- **Zustand state management** (faster than Context API)
- **30-day sessions** with automatic refresh
- **Rate limiting** (prevents brute force)
- **Helmet.js security** headers
- **CSRF protection** built-in

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console access

### Step 1: Set Up Google OAuth

Follow the detailed guide: **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

This will walk you through:
1. Creating a Google Cloud project
2. Setting up OAuth consent screen
3. Creating OAuth credentials
4. Getting your Client ID and Secret

### Step 2: Configure Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Fill in your environment variables:**
   ```bash
   # Generate a random secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Add to .env:
   BETTER_AUTH_SECRET=<paste-generated-secret-here>
   BETTER_AUTH_URL=http://localhost:5000
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   MONGODB_URI=<your-mongodb-connection-string>
   APP_URL=http://localhost:3000
   PORT=5000
   ```

4. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port 5000
   ```

### Step 3: Configure Frontend

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **No `.env` needed!**  
   Better-Auth handles everything on the backend.

3. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

   Visit: http://localhost:3000

---

## 📋 Testing Checklist

### 1. Google OAuth Login
- [ ] Click "Continue with Google" on login page
- [ ] Google OAuth popup appears
- [ ] Select your Google account
- [ ] You're redirected to the dashboard
- [ ] Your profile picture and name appear in the sidebar

### 2. Session Persistence
- [ ] Close the browser tab
- [ ] Reopen http://localhost:3000
- [ ] You're still logged in (no need to sign in again)
- [ ] Session lasts 30 days

### 3. Protected Routes
- [ ] Try visiting http://localhost:3000/dashboard without logging in
- [ ] You should be redirected to /login
- [ ] After logging in, you can access all pages

### 4. Logout
- [ ] Click your profile picture in the sidebar
- [ ] Click "Logout"
- [ ] You're redirected to the login page
- [ ] Trying to access protected routes redirects to login

### 5. API Calls
- [ ] Create a bank account
- [ ] Add transactions
- [ ] View dashboard analytics
- [ ] All API calls work with HTTPOnly cookies (no tokens in localStorage!)

### 6. Security
- [ ] Open DevTools → Application → Cookies
- [ ] You should see a `better-auth.session_token` cookie with:
  - ✅ HttpOnly flag (JavaScript can't access it)
  - ✅ SameSite=Lax (CSRF protection)
  - ✅ Secure (in production)
- [ ] Open DevTools → Application → Local Storage
- [ ] No JWT token stored (removed for security)

---

## 🔒 Security Features

### 1. HTTPOnly Cookies
- Session tokens stored in HTTPOnly cookies
- JavaScript cannot access tokens → XSS protection
- Automatically sent with every API request

### 2. CSRF Protection
- Better-Auth includes CSRF tokens
- SameSite cookie attribute prevents cross-site attacks
- State parameter validation in OAuth flow

### 3. Rate Limiting
- **Auth endpoints:** 5 requests per 15 minutes
- **API endpoints:** 100 requests per 15 minutes
- Prevents brute force attacks

### 4. Security Headers (Helmet.js)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (in production)
- And more...

### 5. Session Management
- 30-day session duration
- Automatic session refresh
- Can revoke sessions (future enhancement)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - Zustand (global state)               │
│  - useAuth hook                          │
│  - HTTPOnly cookies (auto-sent)         │
└─────────────────────────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────────────────────────────┐
│         Backend (Express)               │
│  - Better-Auth (session handling)       │
│  - MongoDB adapter                       │
│  - Google OAuth provider                │
│  - Rate limiting                         │
│  - Security middleware                  │
└─────────────────────────────────────────┘
                  │
                  │
┌─────────────────────────────────────────┐
│         MongoDB Database                │
│  - users (user profiles)                │
│  - sessions (Better-Auth managed)       │
│  - accounts (OAuth provider data)       │
│  - transactions, bank accounts, etc.    │
└─────────────────────────────────────────┘
```

---

## 📂 File Structure

### New Files Created:
```
backend/
├── lib/
│   └── auth.js                    ✨ Better-Auth configuration
├── middleware/
│   ├── betterAuthMiddleware.js    ✨ Session validation
│   └── rateLimiter.js             ✨ Rate limiting
├── models/
│   └── User.js                    🔄 Updated (removed password)
└── server.js                      🔄 Updated (Better-Auth mounted)

frontend/
├── src/
│   ├── lib/
│   │   └── authClient.js          ✨ Better-Auth client
│   ├── stores/
│   │   └── authStore.js           ✨ Zustand store
│   ├── hooks/
│   │   └── useAuth.js             ✨ Auth hook
│   ├── pages/
│   │   └── Login.jsx              🔄 Updated (Google only)
│   ├── components/
│   │   └── PrivateRoute.jsx       🔄 Updated (Zustand)
│   └── services/
│       └── api.js                 🔄 Updated (HTTPOnly cookies)
```

### Removed/Archived Files:
```
backend/
├── routes/auth.js.old             ❌ Old JWT auth routes
└── middleware/auth.js.old         ❌ Old JWT middleware

frontend/
├── src/
│   ├── context/AuthContext.jsx.old  ❌ Old React Context
│   └── pages/Register.jsx.old        ❌ Email/password registration
```

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error
**Problem:** Google OAuth redirect URI doesn't match.

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Make sure you have: `http://localhost:5000/api/auth/callback/google`
4. Exact match required (no trailing slash)

### "Cannot GET /api/auth/session" Error
**Problem:** Backend not running or CORS issue.

**Solution:**
1. Make sure backend is running on port 5000
2. Check CORS configuration in `server.js`
3. Verify `APP_URL=http://localhost:3000` in backend `.env`

### "401 Unauthorized" on API Calls
**Problem:** Session cookie not being sent.

**Solution:**
1. Check `withCredentials: true` in `api.js`
2. Verify backend CORS has `credentials: true`
3. Make sure both frontend and backend are on localhost (not mixing localhost and 127.0.0.1)

### Session Not Persisting
**Problem:** User has to login again after refresh.

**Solution:**
1. Check browser cookies (DevTools → Application → Cookies)
2. Make sure `better-auth.session_token` cookie exists
3. Verify cookie has `HttpOnly` flag
4. Check if browser is blocking cookies

### Build Errors
**Problem:** `npm run build` fails.

**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check for TypeScript errors (if using TS)
4. Make sure all imports are correct

---

## 🚦 Production Deployment

### Environment Variables (Production)

**Backend `.env`:**
```bash
NODE_ENV=production
PORT=5000
BETTER_AUTH_SECRET=<long-random-secret>
BETTER_AUTH_URL=https://api.yourdomain.com
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
MONGODB_URI=<your-production-mongodb-uri>
APP_URL=https://yourdomain.com
```

**Google OAuth Configuration:**
1. Go to Google Cloud Console → Credentials
2. Add production redirect URI:
   ```
   https://api.yourdomain.com/api/auth/callback/google
   ```
3. Add production origins:
   ```
   https://yourdomain.com
   https://api.yourdomain.com
   ```

### Deployment Checklist:
- [ ] Use HTTPS (required for secure cookies)
- [ ] Set `NODE_ENV=production`
- [ ] Update `BETTER_AUTH_URL` to production URL
- [ ] Update `APP_URL` to production URL
- [ ] Add production redirect URIs in Google Console
- [ ] Use strong random secrets (32+ characters)
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and logging
- [ ] Test OAuth flow in production

---

## 📚 Additional Resources

- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [HTTPOnly Cookies Explanation](https://owasp.org/www-community/HttpOnly)

---

## 🎯 Next Steps (Optional Enhancements)

Want to add more features? Here are some ideas:

1. **Email Verification**  
   Require users to verify their Google email before using the app

2. **Two-Factor Authentication (2FA)**  
   Add TOTP for extra security

3. **Session Management Dashboard**  
   View and revoke active sessions from different devices

4. **Account Deletion**  
   Allow users to permanently delete their account

5. **Multiple OAuth Providers**  
   Add GitHub, Microsoft, Apple sign-in

6. **Role-Based Access Control**  
   Add admin/user roles with different permissions

---

## 📝 Notes

- **Old data:** Existing users in the database will still work! Their emails are preserved.
- **Password users:** If you had email/password users, they now need to sign in with Google using the same email.
- **Development mode:** In development, Google OAuth works with http://localhost. In production, you need HTTPS.

---

## ✅ Migration Complete!

Your Budget Tracker now has:
- ✅ Secure authentication with Better-Auth
- ✅ Google OAuth integration
- ✅ HTTPOnly cookies (XSS protection)
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Zustand state management
- ✅ 30-day sessions
- ✅ Security headers

**Ready to test?** Follow the Getting Started guide above!

Need help? Refer to [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed OAuth setup instructions.

Happy budgeting! 💰📊
