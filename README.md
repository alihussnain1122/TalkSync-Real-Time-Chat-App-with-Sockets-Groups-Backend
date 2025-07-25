# TalkSync-Real-Time-Chat-App-with-Sockets-Groups-Backend

## Environment Configuration

This backend supports different environments (development and production) with automatic environment variable loading.

### Environment Files

- `.env.development` - Used for local development (localhost URLs)
- `.env.production` - Used for production deployment (production URLs)
- `.env` - Fallback environment file

### Required Environment Variables

```
MONGODB_URL=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
BASE_URL=your_backend_base_url
USER_EMAIL=your_email_for_sending_verification_emails
EMAIL_PASS=your_email_app_password
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Running the Application

#### Development Mode
```bash
# On Unix/Linux/Mac
npm run dev

# On Windows
npm run dev:win
```

#### Production Mode
```bash
# On Unix/Linux/Mac
npm run start

# On Windows
npm run start:win
```

### Email Verification

The application now automatically uses the correct BASE_URL for email verification links based on the environment:

- **Development**: Uses `http://localhost:5000` for verification links
- **Production**: Uses `https://talksync-kvsb.onrender.com` for verification links

When users register, they receive a professional HTML email with a verification link that works correctly in both development and production environments.
