# Google OAuth Setup Guide for FNP

## Prerequisites
- A Google account
- Your application running locally or deployed

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click on the project dropdown at the top
- Click "New Project"
- Enter project name: "FNP Gifts" (or any name)
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API"
- Click on it and press "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Select "External" (for testing) or "Internal" (for organization)
- Click "Create"
- Fill in the required fields:
  - App name: "FNP Gifts"
  - User support email: your-email@example.com
  - Developer contact email: your-email@example.com
- Click "Save and Continue"
- Skip the Scopes section (click "Save and Continue")
- Add test users if using External (your email)
- Click "Save and Continue"

### 5. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth client ID"
- Select "Web application"
- Name: "FNP Web Client"
- Add Authorized JavaScript origins:
  - http://localhost:3000
  - http://172.16.0.2:3000 (your network IP)
  - https://yourdomain.com (production)
- Add Authorized redirect URIs:
  - http://localhost:3000/api/auth/callback/google
  - http://172.16.0.2:3000/api/auth/callback/google
  - https://yourdomain.com/api/auth/callback/google (production)
- Click "Create"

### 6. Copy Credentials
- You'll see a popup with your Client ID and Client Secret
- Copy both values

### 7. Update .env File
Create or update your `.env` file in the project root:

```bash
# Add these lines to your .env file
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

To generate NEXTAUTH_SECRET, run:
```bash
openssl rand -base64 32
```

Or use this PowerShell command:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 8. Run Database Migration
The User model has been updated to support OAuth. Run:
```bash
npm run prisma:migrate
```

### 9. Restart Your Server
```bash
npm run dev
```

### 10. Test Google Sign-In
- Go to http://localhost:3000/login
- Click "Sign in with Google"
- Authorize the app
- You should be logged in!

## Production Deployment

When deploying to production:

1. Update Authorized redirect URIs in Google Console:
   - Add: https://yourdomain.com/api/auth/callback/google

2. Update environment variables:
   ```bash
   NEXTAUTH_URL="https://yourdomain.com"
   GOOGLE_CLIENT_ID="your-production-client-id"
   GOOGLE_CLIENT_SECRET="your-production-client-secret"
   ```

3. Make sure to use a strong NEXTAUTH_SECRET in production

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches your callback URL
- Check for http vs https
- Check for trailing slashes

### Error: "Access blocked: This app's request is invalid"
- Configure OAuth consent screen properly
- Add your email as a test user if using External type

### Users can't sign in
- Check if Google+ API is enabled
- Verify OAuth consent screen is published or in testing with correct users
- Check environment variables are loaded correctly

## Support
For more details, visit: https://next-auth.js.org/providers/google
