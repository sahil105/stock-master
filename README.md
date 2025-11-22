# Stock Master

A full-stack application with OTP authentication, featuring a React frontend and FastAPI backend.

## Project Structure

```
stock-master/
├── backend/          # FastAPI backend service
│   └── app/          # Backend application code
├── src/              # React frontend
│   ├── components/   # React components
│   └── services/     # API service layer
└── public/           # Static assets
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js and npm
- MySQL database
- Gmail account (for OTP email service)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Windows CMD:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r app/requirements.txt

# Create .env file (see SETUP_ENV.md for details)
# Or use the PowerShell script:
.\create_env.ps1

# Test database connection
python -m app.test

# Test all services
python -m app.test_services

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file (or use the PowerShell script)
.\create_env.ps1

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## Environment Variables

See [SETUP_ENV.md](SETUP_ENV.md) for detailed environment variable setup instructions.

### Backend (.env in `backend/` directory)
- `EMAIL_ADDRESS` - Gmail address for sending OTPs
- `EMAIL_PASSWORD` - Gmail App Password (not regular password)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database configuration
- `OTP_LENGTH` - Length of OTP code (default: 6)
- `OTP_EXPIRY_MINUTES` - OTP expiration time (default: 5)

### Frontend (.env in root directory)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8000)

## Testing

### Backend Services Test

Comprehensive test suite for all backend services:

```bash
cd backend
python -m app.test_services
```

This will test:
- Configuration loading
- Database connection
- Database tables
- OTP generation
- Email service (optional)
- API endpoints (requires running server)

### Database Connection Test

Simple database connectivity test:

```bash
cd backend
python -m app.test
```

## API Endpoints

### POST /send-otp
Send OTP to an email address.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent"
}
```

### POST /verify-otp
Verify an OTP code.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified"
}
```

## Features

- ✅ OTP generation and email delivery
- ✅ OTP verification with expiration
- ✅ React frontend with API integration
- ✅ Comprehensive test suite
- ✅ Environment-based configuration
- ✅ Database persistence

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
