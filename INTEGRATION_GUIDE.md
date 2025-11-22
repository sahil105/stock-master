# Integration Guide

This document explains how the frontend and backend are integrated and how to test everything.

## What Has Been Set Up

### 1. Environment Configuration

#### Backend Environment Variables (`backend/.env`)
All backend services are configured through environment variables:
- **Email Service**: Gmail SMTP configuration for sending OTP emails
- **Database**: MySQL connection settings
- **OTP Settings**: Length and expiration time

#### Frontend Environment Variables (`.env` in root)
- **API URL**: Backend API endpoint for React app

#### Setup Scripts
- `backend/create_env.ps1` - PowerShell script to create backend .env file
- `create_env.ps1` - PowerShell script to create frontend .env file
- `SETUP_ENV.md` - Detailed setup instructions

### 2. Backend Services

#### Services Created:
1. **OTP Generator** (`otp_generator.py`)
   - Generates secure numeric OTPs
   - Configurable length

2. **Email Service** (`email_service.py`)
   - Sends OTP via Gmail SMTP
   - Configurable SMTP settings

3. **Database Service** (`database.py`)
   - SQLAlchemy ORM setup
   - Session management
   - Supports MySQL

4. **API Endpoints** (`main.py`)
   - `POST /send-otp` - Send OTP to email
   - `POST /verify-otp` - Verify OTP code

#### Test Suite (`test_services.py`)
Comprehensive test suite that tests:
- ✅ Configuration loading
- ✅ Database connection
- ✅ Database tables creation
- ✅ OTP generation
- ✅ Email service (optional)
- ✅ API endpoints (requires running server)

### 3. Frontend Integration

#### API Service (`src/services/api.js`)
- `sendOTP(email)` - Send OTP to email
- `verifyOTP(email, otp)` - Verify OTP code
- `checkAPIHealth()` - Check if backend is running

#### OTP Form Component (`src/components/OTPForm.js`)
- Two-step form (email → OTP verification)
- Error handling and user feedback
- Loading states
- Success/error messages

#### App Integration (`src/App.js`)
- API health check on load
- Connection status indicator
- Integrated OTP form

### 4. Testing

#### How to Test Backend Services

1. **Test Database Connection:**
   ```powershell
   cd backend
   python -m app.test
   ```

2. **Test All Services:**
   ```powershell
   cd backend
   python -m app.test_services
   ```

3. **Test API Endpoints:**
   - Start the backend server:
     ```powershell
     cd backend
     uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
     ```
   - The test suite will prompt you to test API endpoints
   - Or use the interactive docs at `http://localhost:8000/docs`

#### How to Test Frontend Integration

1. **Start Backend:**
   ```powershell
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend:**
   ```powershell
   npm start
   ```

3. **Test Flow:**
   - Open `http://localhost:3000`
   - Check API connection status (should show "Connected")
   - Enter an email address
   - Click "Send OTP"
   - Check your email for the OTP code
   - Enter the OTP code
   - Click "Verify OTP"

## Integration Flow

```
User → Frontend (React) → API Service → Backend (FastAPI) → Services
                                                              ├─ OTP Generator
                                                              ├─ Email Service
                                                              └─ Database
```

### Request Flow:
1. User enters email in React form
2. `sendOTP()` calls `POST /send-otp`
3. Backend generates OTP, stores in database, sends email
4. User receives email with OTP
5. User enters OTP in React form
6. `verifyOTP()` calls `POST /verify-otp`
7. Backend validates OTP and returns result

## Environment Variables Reference

### Backend (`backend/.env`)
```env
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=465
DB_HOST=localhost
DB_PORT=3306
DB_USER=team_maven
DB_PASSWORD=maven@123
DB_NAME=StockMaster
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
```

### Frontend (`.env` in root)
```env
REACT_APP_API_URL=http://localhost:8000
```

## Troubleshooting

### Backend Issues

**Database Connection Failed:**
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database exists
- Check user permissions

**Email Not Sending:**
- Verify Gmail App Password (not regular password)
- Check 2FA is enabled on Gmail account
- Verify SMTP settings

**API Not Responding:**
- Check server is running on correct port
- Verify CORS settings if accessing from different origin
- Check firewall settings

### Frontend Issues

**API Connection Failed:**
- Verify backend server is running
- Check `REACT_APP_API_URL` in `.env`
- Ensure backend is accessible from frontend
- Check browser console for errors

**OTP Not Received:**
- Check spam folder
- Verify email address is correct
- Check backend logs for errors
- Verify email service is configured correctly

## Next Steps

1. **Set up environment variables** using the scripts or manually
2. **Test database connection** using `python -m app.test`
3. **Test all services** using `python -m app.test_services`
4. **Start backend server** and verify API docs
5. **Start frontend** and test the full flow
6. **Customize** the UI and add additional features as needed

## Files Created/Modified

### Created:
- `backend/app/test_services.py` - Comprehensive test suite
- `src/services/api.js` - API service layer
- `src/components/OTPForm.js` - OTP form component
- `src/components/OTPForm.css` - Component styles
- `backend/create_env.ps1` - Backend env setup script
- `create_env.ps1` - Frontend env setup script
- `SETUP_ENV.md` - Environment setup guide
- `INTEGRATION_GUIDE.md` - This file

### Modified:
- `backend/app/test.py` - Updated to use environment variables
- `src/App.js` - Integrated with backend API
- `src/App.css` - Updated styles for new UI
- `README.md` - Added project documentation
- `.gitignore` - Added .env files

