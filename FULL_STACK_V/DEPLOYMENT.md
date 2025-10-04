# Deployment Guide

## Environment Variables Setup

Create a `.env.local` file or set these variables in your deployment platform:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Mukheimar <noreply@yourdomain.com>

# Base URL for deployment
BASE_URL=https://yourdomain.com

# AI Image Generation
FAL_KEY=your-fal-key
NEXT_PUBLIC_FAL_KEY=your-fal-key

# Redis (optional)
REDIS_URL=your-redis-url
```

## Common 404 Issues and Solutions

### 1. Missing Environment Variables
- Ensure all required environment variables are set
- `NEXTAUTH_URL` must match your production domain
- `BASE_URL` must be your production domain

### 2. Build Configuration
- The project now includes `output: 'standalone'` in `next.config.mjs`
- This ensures proper deployment on Vercel and other platforms

### 3. API Routes
- All API routes are properly configured
- The `vercel.json` file includes routing configuration

### 4. Database Connection
- Ensure MongoDB URI is correct and accessible
- Check if your MongoDB cluster allows connections from your deployment platform

## Deployment Steps

1. **Set Environment Variables**: Add all required variables to your deployment platform
2. **Connect Repository**: Link your Git repository to your deployment platform
3. **Build Settings**: Use default Next.js build settings
4. **Deploy**: Trigger deployment

## Troubleshooting

### If you get 404 errors:
1. Check that all environment variables are set
2. Verify the `NEXTAUTH_URL` matches your domain
3. Ensure MongoDB is accessible
4. Check the deployment logs for specific errors

### If authentication fails:
1. Verify Google OAuth credentials
2. Check `NEXTAUTH_SECRET` is set
3. Ensure `ADMIN_EMAIL` matches your admin account

### If database operations fail:
1. Check `MONGODB_URI` is correct
2. Verify database permissions
3. Check if MongoDB Atlas allows connections from your deployment IP
