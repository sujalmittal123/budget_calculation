# 🔍 DEBUGGING LOGIN LOOP - Step by Step

## Problem Summary
You login with Google successfully, but then get redirected back to the login page in an infinite loop.

## What We've Fixed So Far
✅ NODE_ENV=production on Render  
✅ Cookie settings: secure=true, sameSite=none  
✅ CORS configured correctly  
✅ Backend is running fine  

## What to Check Now

### Step 1: Clear ALL Browser Data (CRITICAL!)

**Why?** Old cookies or cached data might be interfering.

1. Press `F12` to open DevTools
2. Go to **Application** tab
3. On the left, click **Storage**
4. Click **"Clear site data"** button
5. Make sure ALL boxes are checked
6. Click **"Clear site data"**
7. Close DevTools
8. Close the browser completely
9. Reopen browser in **Incognito/Private mode**

### Step 2: Test Login with DevTools Open

1. Open **Incognito window**
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Check "Preserve log" checkbox (important!)
5. Go to: https://budget-calculation.vercel.app
6. Click "Continue with Google"
7. Complete Google authentication
8. **WATCH THE NETWORK TAB**

### Step 3: What to Look For

After you complete Google authentication, you should see these requests in Network tab:

#### Request 1: Google Callback
- URL: `https://budget-calculation.onrender.com/api/auth/google/callback?code=...`
- Status: `302` (redirect)
- Look at **Response Headers** → Should have `set-cookie: budget.sid=...`

#### Request 2: Session Check
- URL: `https://budget-calculation.onrender.com/api/auth/session`
- Status: `200`
- Look at **Request Headers** → Should have `cookie: budget.sid=...`
- Look at **Response** → Should have `{"success":true,"data":{"user":{...}}}`

### Step 4: Check Cookies

After login attempt:

1. In DevTools, go to **Application** tab
2. Expand **Cookies** in left sidebar
3. Click on `https://budget-calculation.onrender.com`
4. Look for cookie named `budget.sid`

**What it should show:**
- Name: `budget.sid`
- Value: (some long string)
- Domain: `budget-calculation.onrender.com`
- Path: `/`
- Expires: (30 days from now)
- HttpOnly: ✓
- Secure: ✓
- SameSite: `None`

### Step 5: Report What You See

**Scenario A: No cookie is created**
If you don't see `budget.sid` cookie at all → Backend isn't setting the cookie

**Scenario B: Cookie exists but not sent**
If cookie exists but `/api/auth/session` request doesn't include it → Browser is blocking it

**Scenario C: Cookie sent but session returns null**
If cookie is sent but response is `{"user":null}` → Session not persisting in MongoDB

## Quick Browser Settings Check

Some browsers block third-party cookies by default:

### Chrome/Edge
1. Settings → Privacy and Security → Cookies
2. Make sure it's NOT set to "Block third-party cookies"

### Firefox
1. Settings → Privacy & Security
2. Under "Enhanced Tracking Protection", click "Custom"
3. Make sure "Cookies" is NOT set to "All third-party cookies"

### Safari
Safari is very strict with cross-domain cookies. If you're using Safari, try Chrome instead.

## Alternative: Test in Different Browser

Try the same login flow in:
- Chrome (if you were using Firefox)
- Edge (if you were using Chrome)
- Firefox (if you were using Safari)

Some browsers are stricter about cross-domain cookies than others.

## What to Share

After following these steps, please tell me:

1. **Cookie Status**: Do you see the `budget.sid` cookie? (Yes/No)
2. **Cookie Settings**: If yes, what are the Domain, SameSite, Secure values?
3. **Network Request**: Does `/api/auth/session` request include the cookie? (Yes/No)
4. **Response Data**: What does `/api/auth/session` return? (Copy the response)
5. **Browser**: Which browser are you using?
6. **Console Errors**: Any red errors in Console tab? (Copy them)

This will tell us EXACTLY what's wrong and we can fix it immediately.
