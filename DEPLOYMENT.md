# Deployment Guide

## Production Deployment Checklist

### 1. Environment Setup
- [ ] Update `.env.production` with production BASE_URL
- [ ] Ensure all environment variables are correctly set
- [ ] Verify email service configuration

### 2. Email Verification Configuration
The email verification system now automatically uses the correct URLs:

**Development Environment:**
- BASE_URL: `http://localhost:5000`
- Verification emails contain localhost links

**Production Environment:**
- BASE_URL: `https://talksync-kvsb.onrender.com`
- Verification emails contain production links

### 3. Testing Email Verification

#### In Development:
```bash
npm run dev:win
```
- Register a new user
- Check that verification email contains: `http://localhost:5000/api/auth/verify/...`

#### In Production:
```bash
npm run start:win
```
- Register a new user
- Check that verification email contains: `https://talksync-kvsb.onrender.com/api/auth/verify/...`

### 4. Environment Variables Required

```env
MONGODB_URL=mongodb+srv://alihussnaintech:c5FIaUgpKmBWbyWM@chatdb.k6zv1zq.mongodb.net/
PORT=5000
JWT_SECRET=AlIchatApp1131
BASE_URL=https://talksync-kvsb.onrender.com
USER_EMAIL=alihussnaintech@gmail.com
EMAIL_PASS=wsqgucqhtzkqzugw
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### 5. CORS Configuration
Make sure your production frontend URL is included in the CORS origins:
- `https://talksync-nine.vercel.app` (Frontend Production URL)
- `https://talksync-kvsb.onrender.com` (Backend Production URL)

## Changes Made

1. **Dynamic BASE_URL**: Authentication controller now uses `process.env.BASE_URL` instead of hardcoded localhost
2. **Environment-specific config**: Separate `.env.development` and `.env.production` files
3. **Professional email template**: HTML email with TalkSync branding and better UX
4. **Automatic environment detection**: Server loads correct environment file based on NODE_ENV
5. **Enhanced logging**: Server logs show current environment and configuration

## Email Template Features

- Professional TalkSync branding
- Responsive HTML design
- Clear call-to-action button
- Fallback text link
- Security notice about 15-minute expiration
- Professional footer with instructions
