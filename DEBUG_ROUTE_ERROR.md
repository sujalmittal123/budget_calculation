# 🔍 Debug: "Route Not Found" Error

## Steps to Identify the Issue

### Step 1: Open Browser Developer Tools

1. Press `F12` on your keyboard
2. Click on the **Console** tab
3. Click on the **Network** tab (keep both visible if possible)

### Step 2: Try the Action That Fails

For example, if adding a transaction fails:
1. Go to Transactions page
2. Click "Add Transaction"
3. Fill the form
4. Click Save

### Step 3: Check Console Tab

Look for RED error messages. Common patterns:

#### Pattern A: "404 Not Found"
```
GET https://budget-calculation.vercel.app/api/transactions 404 (Not Found)
```
**Meaning:** Frontend is calling wrong URL (should be .onrender.com not .vercel.app)

#### Pattern B: "Network Error" or "CORS Error"
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Meaning:** CORS configuration issue

#### Pattern C: "401 Unauthorized"
```
POST https://budget-calculation.onrender.com/api/transactions 401 (Unauthorized)
```
**Meaning:** Session not being sent properly

### Step 4: Check Network Tab

1. Click on the **Network** tab
2. Find the failed request (it will be RED)
3. Click on it
4. Look at:
   - **Request URL:** Where is it going?
   - **Request Headers:** Is `X-Session-Id` present?
   - **Response:** What error message?

### Step 5: Check LocalStorage

1. Go to **Application** tab in DevTools
2. Expand **Local Storage** on the left
3. Click on `https://budget-calculation.vercel.app`
4. **Do you see `sessionId`?**
   - ✅ Yes → Copy the value, we'll need it
   - ❌ No → This is the problem!

## Common Issues & Fixes

### Issue 1: No sessionId in LocalStorage

**Symptoms:**
- Route not found or 401 errors
- sessionId missing from Local Storage

**Fix:**
1. Log out
2. Clear all site data (F12 → Application → Clear site data)
3. Log in again
4. After redirect, check if sessionId is stored

### Issue 2: API calling wrong domain

**Symptoms:**
Console shows: `https://budget-calculation.vercel.app/api/...` (wrong!)
Should be: `https://budget-calculation.onrender.com/api/...`

**Fix:**
This means Vercel environment variable isn't set. Need to check Vercel dashboard.

### Issue 3: Session ID not being sent

**Symptoms:**
- Network tab shows request to `/api/transactions`
- But **Request Headers** don't include `X-Session-Id`

**Fix:**
Frontend interceptor not working. Need to refresh page hard: `Ctrl + Shift + R`

## What to Report Back

Please tell me:

1. **Console Errors:**
   ```
   [Copy paste any RED errors from Console tab]
   ```

2. **Network Tab:**
   - Request URL: `https://...`
   - Status Code: `404` or `401` or `500` etc.
   - Request Headers: Does it have `X-Session-Id`? (Yes/No)

3. **LocalStorage:**
   - Is `sessionId` present? (Yes/No)
   - If yes, what's the first 10 characters? (e.g., `abc123xyz...`)

4. **Which page/action fails:**
   - Transactions page won't load
   - Add transaction button doesn't work
   - Specific error message shown on screen

## Quick Test Commands

### Test 1: Check if session is valid

Open browser console and run:
```javascript
console.log('Session ID:', localStorage.getItem('sessionId'));
```

### Test 2: Manually test API

In browser console:
```javascript
fetch('https://budget-calculation.onrender.com/api/transactions', {
  headers: {
    'X-Session-Id': localStorage.getItem('sessionId'),
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('Result:', d))
.catch(e => console.error('Error:', e));
```

This will tell us if the API is working.

## Expected Behavior

✅ **What should happen:**
- Console: No red errors
- Network: All requests show 200 status
- Request headers include: `X-Session-Id: [your-session-id]`
- LocalStorage contains: `sessionId`
- Actions work: Add/edit/delete transactions

❌ **What's happening now:**
- "Route not found" error
- Some requests failing

---

**Please provide the information from Steps 1-5 above so I can pinpoint the exact issue!**
