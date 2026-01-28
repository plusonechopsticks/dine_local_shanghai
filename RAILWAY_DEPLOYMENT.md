# Railway Deployment Guide

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Start Project"
3. Sign in with GitHub (authorize Railway to access your repos)

## Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select `plusonechopsticks/dine_local_shanghai`
4. Railway will auto-detect it's a Node.js app

## Step 3: Add MySQL Database
1. In your Railway project, click "New"
2. Select "Database" → "MySQL"
3. Railway will auto-provision a MySQL database
4. It will automatically set `DATABASE_URL` environment variable

## Step 4: Configure Environment Variables
In Railway project settings, add these variables:

### Required
```
JWT_SECRET=generate-a-random-32-char-string-here
NODE_ENV=production
```

### Optional (for OAuth/features)
```
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_APP_ID=your-app-id
OWNER_OPEN_ID=your-owner-id
```

## Step 5: Configure Service Port
1. Click on the Node.js service in Railway
2. Go to "Settings" → "Port"
3. Set port to: `3001` (or Railway will auto-assign)
4. Railway will set `PORT` environment variable automatically

## Step 6: Deploy
1. Railway automatically deploys when you push to GitHub
2. Watch the deployment progress in Railway dashboard
3. Once green, click "View Deployment" to see your live app

## Step 7: Run Database Migrations
After first deployment:
1. In Railway, click on the Node.js service
2. Go to "Deployments" → Recent deployment
3. Click "Logs" tab
4. Drizzle migrations should run automatically

## Database Connection
Railway automatically provides:
- `DATABASE_URL`: MySQL connection string
- Host, username, password all configured
- No additional setup needed!

## For Image Storage (3 Options)

### Option A: Base64 in Database (Simplest)
- No additional setup needed
- Works for images up to ~10MB
- Good for initial launch
- Store images directly in database

### Option B: AWS S3 (Recommended for scale)
1. Create AWS S3 bucket
2. Get access keys from AWS IAM
3. Add to Railway env vars:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name
```

### Option C: Supabase Storage (Easiest S3)
1. Create Supabase project
2. Get API keys
3. Add to Railway env vars
4. Our code can connect automatically

## Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` in Railway settings
- Make sure MySQL service is running (should be green)
- Check deployment logs

### Build Failed
- Check Node version (should be 18+)
- Check logs for missing dependencies
- Run `pnpm install` locally to verify

### App won't start
- Check `npm start` command in logs
- Make sure `dist/` folder was built
- Check for missing environment variables

## Monitoring
- Railway dashboard shows:
  - Deployment status
  - CPU/Memory usage
  - Network logs
  - Error logs
  - Database connection status

## Next Steps
1. Test the app at the Railway URL
2. Test host registration form
3. Test image uploads
4. Test form submission to database
5. Connect custom domain if needed

## Support
- Railway docs: https://docs.railway.app
- Contact us if issues arise

