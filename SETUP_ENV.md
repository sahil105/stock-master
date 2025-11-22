# Environment Setup Guide

This guide will help you set up the environment variables for both the backend and frontend.

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Email Configuration
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=465

# Database Configuration
# Option 1: Use DATABASE_URL (recommended for production)
# DATABASE_URL=mysql+pymysql://username:password@host:port/database_name

# Option 2: Use separate database fields (recommended for development)
DB_HOST=localhost
DB_PORT=3306
DB_USER=team_maven
DB_PASSWORD=maven@123
DB_NAME=StockMaster

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
```

### Gmail Setup for Email Service

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Stock Master" as the name
   - Copy the generated 16-character password
   - Use this password as `EMAIL_PASSWORD` (not your regular Gmail password)

## Frontend Environment Variables

Create a `.env` file in the root directory with:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8000
```

## Quick Setup Commands

### Windows PowerShell:
```powershell
# Backend .env
@"
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=465
DB_HOST=localhost
DB_PORT=3306
DB_USER=team_maven
DB_PASSWORD=maven@123
DB_NAME=StockMaster
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
"@ | Out-File -FilePath backend\.env -Encoding utf8

# Frontend .env
@"
REACT_APP_API_URL=http://localhost:8000
"@ | Out-File -FilePath .env -Encoding utf8
```

### Linux/macOS:
```bash
# Backend .env
cat > backend/.env << EOF
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=465
DB_HOST=localhost
DB_PORT=3306
DB_USER=team_maven
DB_PASSWORD=maven@123
DB_NAME=StockMaster
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
EOF

# Frontend .env
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000
EOF
```

## Testing Your Setup

After setting up the environment variables:

1. **Test Backend Services:**
   ```bash
   cd backend
   python -m app.test_services
   ```

2. **Test Database Connection:**
   ```bash
   cd backend
   python -m app.test
   ```

3. **Start Backend Server:**
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Start Frontend:**
   ```bash
   npm start
   ```

## Important Notes

- Never commit `.env` files to version control
- The `.env.example` files are templates you can share
- Update the values in `.env` with your actual credentials
- For production, use secure methods to manage environment variables

