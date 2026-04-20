# Google OAuth Setup Instructions

This guide will walk you through setting up Google Sign-In for your application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "Student Success App")
5. Click **"Create"**

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"Google Identity Services"**
3. Click on it and click **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: Student Success Platform (or your app name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
   - Add: `email`, `profile`, `openid`
7. Click **"Save and Continue"**
8. On the **Test users** page (if External), add test users (your email) if needed
9. Click **"Save and Continue"** and then **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first (you already did this)
4. Choose **"Web application"** as the application type
5. Give it a name (e.g., "Student Success Web Client")
6. **Authorized JavaScript origins** (IMPORTANT - Add ALL of these):
   - `http://localhost:5173` (Vite default port)
   - `http://127.0.0.1:5173` (alternative localhost format)
   - `http://localhost:3000` (if you're using a different port)
   - `http://127.0.0.1:3000` (if using port 3000)
   - **Note**: Make sure there are NO trailing slashes (use `http://localhost:5173` NOT `http://localhost:5173/`)
   - Add your production URL when deploying (e.g., `https://yourdomain.com`)
7. **Authorized redirect URIs**:
   - `http://localhost:5173` (for local development)
   - `http://127.0.0.1:5173` (alternative format)
   - Add your production URL when deploying
8. Click **"Create"**
9. **IMPORTANT**: Copy the **Client ID** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **DO NOT** share your Client Secret publicly (it's not needed for this implementation)

## Step 5: Configure Your Application

### Frontend Configuration

1. In your project root, create or edit `.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. Replace `your-client-id-here.apps.googleusercontent.com` with your actual Client ID from Step 4.

3. **Important**: Make sure `.env` is in your `.gitignore` file to avoid committing secrets!

### Backend Configuration

The backend is already configured to verify Google tokens. Make sure your backend is running:

```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Step 6: Test the Integration

1. Start your frontend:
   ```bash
   npm run dev
   ```

2. Start your backend:
   ```bash
   cd Backend
   uvicorn main:app --reload
   ```

3. Navigate to the login page
4. You should see a **"Sign in with Google"** button
5. Click it and select your Google account
6. You should be logged in with your real Google account!

## Troubleshooting

### "Error 400: origin_mismatch" (Most Common Issue!)
**This means your frontend URL is not registered in Google Cloud Console.**

**Quick Fix:**
1. Check what port your frontend is running on (look at your terminal - it should show something like `Local: http://localhost:5173`)
2. Go to [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, click **"+ ADD URI"**
5. Add the EXACT URL you see in your browser (e.g., `http://localhost:5173` or `http://127.0.0.1:5173`)
   - **Important**: 
     - Use the EXACT protocol (`http://` not `https://` for localhost)
     - Use the EXACT port number
     - NO trailing slash (`http://localhost:5173` NOT `http://localhost:5173/`)
     - Add BOTH `localhost` and `127.0.0.1` formats if needed
6. Click **"SAVE"**
7. Wait 1-2 minutes for changes to propagate
8. Refresh your browser and try again

**Common Mistakes:**
- ❌ Adding `https://localhost:5173` (should be `http://` for localhost)
- ❌ Adding `http://localhost:5173/` (trailing slash causes issues)
- ❌ Not adding both `localhost` and `127.0.0.1` formats
- ❌ Wrong port number (check your terminal output)

### "Google OAuth is not configured" error
- Make sure you've created `.env` file with `VITE_GOOGLE_CLIENT_ID`
- Restart your dev server after adding the environment variable
- Check that the Client ID doesn't have extra spaces or quotes

### "Invalid Google token" error
- Make sure your backend is running on port 8000
- Check that `VITE_API_BASE_URL` matches your backend URL
- Verify your Google Cloud project has the API enabled

### Button not showing
- Check browser console for errors
- Make sure the Google Identity Services script is loading
- Verify your Client ID is correct in `.env`

### CORS errors
- Make sure your backend CORS settings include your frontend URL
- Check `Backend/main.py` for allowed origins

## Production Deployment

When deploying to production:

1. Update **Authorized JavaScript origins** in Google Cloud Console:
   - Add your production domain (e.g., `https://yourdomain.com`)

2. Update **Authorized redirect URIs**:
   - Add your production domain

3. Update your production `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   VITE_API_BASE_URL=https://your-api-domain.com
   ```

4. Make sure your OAuth consent screen is published (not in testing mode) for public use

## Security Notes

- Never commit your `.env` file to version control
- The Client ID can be public (it's safe to expose in frontend code)
- The backend verifies tokens with Google, so fake tokens won't work
- For production, consider using environment-specific Client IDs

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)

