# Quick Fix: Google OAuth Origin Mismatch Error

## Error Message
```
Error 400: origin_mismatch
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
```

## Solution (5 Steps)

### Step 1: Find Your Frontend URL
Look at your terminal where `npm run dev` is running. You should see something like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Note the exact URL** (usually `http://localhost:5173`)

### Step 2: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if you haven't)
3. Go to **APIs & Services** > **Credentials**

### Step 3: Edit Your OAuth Client
1. Find your OAuth 2.0 Client ID (the one you're using)
2. Click on it to edit

### Step 4: Add Authorized JavaScript Origins
1. Scroll down to **Authorized JavaScript origins**
2. Click **"+ ADD URI"**
3. Add these URLs (replace `5173` with your actual port if different):
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```
   **Important:**
   - Use `http://` NOT `https://` for localhost
   - NO trailing slash at the end
   - Add BOTH `localhost` and `127.0.0.1` formats

### Step 5: Save and Wait
1. Click **"SAVE"** at the bottom
2. Wait 1-2 minutes for Google's servers to update
3. Refresh your browser
4. Try Google Sign-In again

## Still Not Working?

### Check Your Exact URL
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Look for any error messages that show the exact origin being used

### Verify Your Port
If your frontend is running on a different port (like 3000, 5174, etc.):
- Add that port to Authorized JavaScript origins
- Format: `http://localhost:YOUR_PORT` and `http://127.0.0.1:YOUR_PORT`

### Common Issues
- **Wrong protocol**: Must be `http://` for localhost, not `https://`
- **Trailing slash**: Remove any `/` at the end
- **Wrong port**: Check your terminal output for the actual port
- **Not saved**: Make sure you clicked "SAVE" in Google Cloud Console
- **Cache**: Clear browser cache or try incognito mode

## Need More Help?
See the full setup guide: `GOOGLE_OAUTH_SETUP.md`



