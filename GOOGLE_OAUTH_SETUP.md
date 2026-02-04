# Google OAuth 2.0 Setup Guide

This guide will walk you through setting up Google OAuth credentials for your Budget Tracker application.

---

## Prerequisites

- Google Account (Gmail)
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Create/Select a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project (or select existing)**
   - Click on the project dropdown at the top
   - Click **"New Project"**
   - Enter project name: `Budget Tracker` (or any name you prefer)
   - Click **"Create"**
   - Wait for the project to be created (30 seconds)

3. **Select Your Project**
   - Make sure your new project is selected in the dropdown

---

## Step 2: Enable Google+ API

1. **Navigate to APIs & Services**
   - In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or visit: https://console.cloud.google.com/apis/library

2. **Search for Google+ API**
   - In the search bar, type: `Google+ API`
   - Click on **"Google+ API"**
   - Click **"Enable"**
   
   *(Note: This API is used for OAuth user profile information)*

3. **Alternative: Enable People API**
   - If Google+ API is deprecated, enable **"Google People API"** instead
   - Search for `People API` → Click → Enable

---

## Step 3: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   - Left sidebar: **"APIs & Services"** → **"OAuth consent screen"**
   - Or visit: https://console.cloud.google.com/apis/credentials/consent

2. **Select User Type**
   - Choose **"External"** (allows anyone with a Google account)
   - Click **"Create"**

3. **Fill in App Information**
   
   **App Information:**
   - **App name:** `Budget Tracker`
   - **User support email:** Your email address
   - **App logo:** (Optional, skip for now)

   **App Domain:**
   - **Application home page:** `http://localhost:3000` (for development)
   - **Application privacy policy link:** (Optional, can skip)
   - **Application terms of service link:** (Optional, can skip)

   **Authorized Domains:**
   - Leave empty for local development
   - For production, add: `yourdomain.com`

   **Developer Contact Information:**
   - **Email addresses:** Your email address

4. **Click "Save and Continue"**

5. **Scopes Page**
   - Click **"Add or Remove Scopes"**
   - Select these scopes (they should be automatically added for OAuth):
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **"Update"**
   - Click **"Save and Continue"**

6. **Test Users (Optional)**
   - For External apps in testing mode, add your email as a test user
   - Click **"Add Users"** → Enter your Gmail
   - Click **"Save and Continue"**

7. **Summary Page**
   - Review your settings
   - Click **"Back to Dashboard"**

---

## Step 4: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**
   - Left sidebar: **"APIs & Services"** → **"Credentials"**
   - Or visit: https://console.cloud.google.com/apis/credentials

2. **Create OAuth Client ID**
   - Click **"+ Create Credentials"** at the top
   - Select **"OAuth client ID"**

3. **Configure OAuth Client**
   
   **Application type:**
   - Select: **"Web application"**

   **Name:**
   - Enter: `Budget Tracker Web Client`

   **Authorized JavaScript origins:**
   - Click **"+ Add URI"**
   - Add: `http://localhost:3000` (frontend URL)
   - Click **"+ Add URI"**
   - Add: `http://localhost:5000` (backend URL)

   **Authorized redirect URIs:**
   - Click **"+ Add URI"**
   - Add: `http://localhost:5000/api/auth/callback/google`
   - This is where Google redirects after authentication

4. **Click "Create"**

5. **Save Your Credentials**
   - A popup will appear with your credentials
   - **Copy and save these values immediately:**
     ```
     Client ID: xxxxx-xxxxxx.apps.googleusercontent.com
     Client Secret: GOCSPX-xxxxxxxxxxxxxxxx
     ```
   - You can also download the JSON file for backup

---

## Step 5: Find Your Credentials Later

If you need to retrieve your credentials later:

1. Go to **"APIs & Services"** → **"Credentials"**
2. Under **"OAuth 2.0 Client IDs"**, find your client name
3. Click the **pencil icon** (Edit) or the client name
4. Your **Client ID** is displayed at the top
5. Your **Client Secret** is shown below it
   - You can create a new secret if needed

---

## Step 6: Add Credentials to Your Project

### Backend Environment Variables

1. **Open:** `backend/.env`

2. **Add/Update these lines:**
   ```bash
   # Better-Auth Configuration
   BETTER_AUTH_SECRET=your-32-character-random-secret-here
   BETTER_AUTH_URL=http://localhost:5000
   
   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
   
   # Application URL
   APP_URL=http://localhost:3000
   
   # Keep your existing MongoDB and other settings
   MONGODB_URI=mongodb+srv://...
   PORT=5000
   ```

3. **Generate a secure random secret for BETTER_AUTH_SECRET:**
   - Run this command in terminal:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Copy the output and paste it as `BETTER_AUTH_SECRET`

### Frontend Environment Variables

1. **Open:** `frontend/.env`

2. **You can remove the Google Client ID:**
   ```bash
   # No longer needed - Better-Auth handles OAuth on backend only
   # VITE_GOOGLE_CLIENT_ID=...
   ```

---

## Step 7: Testing Your Setup

After implementing Better-Auth (which we'll do next), test your OAuth setup:

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start your frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit:** `http://localhost:3000/login`

4. **Click "Sign in with Google"**
   - You should see a Google OAuth popup
   - Select your Google account
   - Grant permissions
   - You should be redirected back to your app

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's configured in Google Console.

**Solution:**
- Go back to Google Cloud Console → Credentials
- Edit your OAuth client
- Make sure you have: `http://localhost:5000/api/auth/callback/google`
- Must be exact match (no trailing slashes)

### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not configured properly.

**Solution:**
- Go to OAuth Consent Screen
- Make sure you've added all required scopes
- Add your email as a test user

### Error: "invalid_client"

**Problem:** Client ID or Client Secret is incorrect.

**Solution:**
- Double-check your `.env` file
- Make sure there are no extra spaces
- Verify the credentials in Google Console
- Restart your backend server after changing `.env`

### Error: "Cookies not being set"

**Problem:** Browser blocking third-party cookies or CORS issues.

**Solution:**
- Make sure frontend and backend URLs match your OAuth origins
- Check CORS configuration in backend
- Try in Incognito mode
- Check browser console for errors

---

## Production Setup (For Later)

When deploying to production:

1. **Update Authorized JavaScript Origins:**
   - Add: `https://yourdomain.com`

2. **Update Authorized Redirect URIs:**
   - Add: `https://yourdomain.com/api/auth/callback/google`

3. **Update Environment Variables:**
   - `BETTER_AUTH_URL=https://yourdomain.com`
   - `APP_URL=https://yourdomain.com`

4. **Publish OAuth Consent Screen:**
   - Go to OAuth Consent Screen
   - Click **"Publish App"**
   - Submit for verification if needed

---

## Security Notes

- **Never commit `.env` files** to version control
- **Keep your Client Secret private** - it's like a password
- **Use environment variables** for all sensitive data
- **Enable 2FA** on your Google account for extra security
- **Rotate secrets** periodically in production

---

## Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Better-Auth Google Provider Guide](https://www.better-auth.com/docs/authentication/social)

---

## What's Next?

After setting up your Google OAuth credentials:

1. ✅ You should have your Client ID and Client Secret
2. ✅ Your `.env` files should be updated
3. ✅ Your OAuth consent screen should be configured
4. ✅ Authorized redirect URIs should be added

**Next Step:** I'll implement Better-Auth in your application to use these credentials!

---

## Quick Reference

**Google Cloud Console URLs:**
- Dashboard: https://console.cloud.google.com/
- APIs & Services: https://console.cloud.google.com/apis
- Credentials: https://console.cloud.google.com/apis/credentials
- OAuth Consent: https://console.cloud.google.com/apis/credentials/consent

**Required Redirect URI:**
```
http://localhost:5000/api/auth/callback/google
```

**Required Scopes:**
- `openid`
- `userinfo.email`
- `userinfo.profile`

---

**Need help?** If you encounter any issues, check the Troubleshooting section or refer to the Google OAuth documentation.

Good luck with your setup! 🚀
