# Stock Master - Inventory Management System

> A comprehensive full-stack inventory management system built with React and FastAPI. Stock Master provides complete warehouse management capabilities including stock tracking, receipts, deliveries, transfers, adjustments, and real-time inventory reporting.

---

## 👥 Team Information

**Team Name:** Blueprint Builders

**Team Members:**
- Bhavin Zala - `bhavin2zala@gmail.com`
- Sahil Suthar - `sutharsahil105@gmail.com`
- Faizan Saiyad - `faizan.saiyad777@gmail.com`
- Jaikirat Singh - `jaikiratsingh07@gmail.com`

---

## 🗓️ Event Details

**Hackathon:** Odoo x SPIT Hackathon 2025 (Virtual Round)  
**Date:** 22nd October 2025  
**Format:** Online / Virtual  
**Organizer:** Odoo IN Pvt Ltd  
**Official Website:** [https://www.odoo.com](https://www.odoo.com)

---

## 🎯 Links
- problem statement ppt : https://docs.google.com/presentation/d/17SG0Va_Duha5nhJftluTH5IBmRt64ZhG/edit?usp=sharing&ouid=114557373931559073589&rtpof=true&sd=true
- video demo : https://drive.google.com/file/d/1Sjz-sTHB-HzdVO5AdQOvU3vqV5bJREYe/view?usp=sharing

## 🎯 Overview

Stock Master is an enterprise-grade inventory management solution that helps businesses track stock levels, manage warehouse operations, and maintain accurate inventory records across multiple warehouses and locations. The system features a modern React frontend with Material-UI components and a robust FastAPI backend with MySQL database.

## ✨ Key Features

### Authentication & Security
- **JWT-based Authentication** - Secure token-based authentication
- **User Registration** - Account creation with email and unique login ID (6-12 characters)
- **Password Reset** - OTP-based password reset via email
- **Argon2 Password Hashing** - Industry-standard password security
- **Role-based Access Control** - User roles and permissions

### Inventory Management
- **Product Management** - Create, update, and manage products with SKU tracking
- **Product Categories** - Organize products into categories
- **Stock Tracking** - Real-time stock levels across warehouses
- **Stock Snapshot** - Current inventory state with on-hand and reserved quantities
- **Low Stock Alerts** - Automatic notifications for products below reorder levels

### Warehouse Operations
- **Warehouse Management** - Multiple warehouse support with codes and addresses
- **Location Management** - Warehouse locations within warehouses
- **Stock Movements** - Complete audit trail of all stock movements
- **Stock Ledger** - Detailed transaction history

### Document Management
- **Receipts** - Incoming stock receipts from vendors
  - Status workflow: Draft → Waiting → Ready → Done
  - Vendor information and contact details
  - Automatic stock updates on validation
- **Deliveries** - Outgoing deliveries to customers
  - Standard, Express, and Bulk delivery types
  - Customer information and scheduling
  - Stock deduction on completion
- **Transfers** - Inter-warehouse stock transfers
  - Transfer between warehouses
  - Status tracking and validation
- **Adjustments** - Stock adjustments for corrections
  - Positive and negative adjustments
  - Reason tracking for audit purposes

### Reporting & Analytics
- **Stock Summary** - Overview of stock across all warehouses
- **Low Stock Report** - Products below reorder levels
- **Movement History** - Complete ledger of all stock movements
- **Dashboard** - KPI metrics and visualizations

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **MySQL** - Relational database with connection pooling
- **JWT** - JSON Web Tokens for authentication
- **Argon2** - Password hashing algorithm
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server
- **python-dotenv** - Environment variable management

### Frontend
- **React 19** - Modern React with hooks
- **Material-UI (MUI)** - Component library and theming
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Scripts** - Build tooling

### Database
- **MySQL 8.0+** - Primary database
- Connection pooling for performance
- Relational schema with proper indexing

## 📁 Project Structure

```
stock-master/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application and routes
│   │   ├── models.py            # Pydantic models and schemas
│   │   ├── config.py            # Configuration and settings
│   │   ├── database.py          # Database connection and models
│   │   ├── email_service.py     # Email/OTP sending service
│   │   ├── otp_generator.py     # OTP generation logic
│   │   ├── test.py              # Database connection tests
│   │   ├── test_services.py     # Comprehensive service tests
│   │   └── requirements.txt     # Python dependencies
│   ├── create_env.ps1           # Environment setup script
│   └── README.md                # Backend-specific documentation
│
├── src/
│   ├── components/              # Reusable React components
│   │   ├── MainLayout.js        # Main application layout
│   │   ├── KpiGrid.js           # KPI dashboard components
│   │   ├── OperationsPanel.js   # Operations sidebar
│   │   ├── DynamicFiltersPanel.js
│   │   ├── FlowTimeline.js
│   │   ├── ProductFormDialog.js
│   │   ├── ReceiptFormDialog.js
│   │   ├── DeliveryDetailDialog.js
│   │   ├── LocationFormDialog.js
│   │   ├── WarehouseFormDialog.js
│   │   ├── MoveHistoryFormDialog.js
│   │   ├── MoveHistoryDetailDialog.js
│   │   ├── ReceiptDetailDialog.js
│   │   ├── OTPForm.js           # OTP verification form
│   │   ├── PaginationControls.js
│   │   └── LogoMark.js
│   │
│   ├── pages/                   # Page components
│   │   ├── DashboardPage.js     # Main dashboard
│   │   ├── LoginPage.js         # User login
│   │   ├── RegisterPage.js      # User registration
│   │   ├── ResetPasswordPage.js # Password reset
│   │   ├── ProductsPage.js      # Product management
│   │   ├── CategoriesPage.js    # Category management
│   │   ├── WarehousesPage.js    # Warehouse management
│   │   ├── LocationsPage.js     # Location management
│   │   ├── StockPage.js         # Stock overview
│   │   ├── ReceiptsPage.js      # Receipt management
│   │   ├── DeliveryPage.js      # Delivery management
│   │   ├── MoveHistoryPage.js   # Movement history/ledger
│   │   ├── SettingsPage.js      # Application settings
│   │   ├── ProfilePage.js       # User profile
│   │   └── NotificationsPage.js # Notifications
│   │
│   ├── services/                # API service layer
│   │   ├── api.js               # Base API configuration
│   │   ├── auth.js              # Authentication utilities
│   │   ├── authApi.js           # Auth API calls
│   │   ├── productApi.js        # Product API calls
│   │   ├── categoryApi.js       # Category API calls
│   │   ├── warehouseApi.js      # Warehouse API calls
│   │   ├── locationApi.js       # Location API calls
│   │   ├── stockApi.js          # Stock API calls
│   │   ├── receiptApi.js        # Receipt API calls
│   │   ├── deliveryApi.js       # Delivery API calls
│   │   ├── transferApi.js       # Transfer API calls
│   │   ├── adjustmentApi.js     # Adjustment API calls
│   │   └── ledgerApi.js         # Ledger API calls
│   │
│   ├── data/
│   │   └── dashboardData.js     # Dashboard mock data
│   │
│   ├── App.js                   # Main App component
│   ├── App.css                  # Global styles
│   └── index.js                 # Application entry point
│
├── public/                      # Static assets
├── stockMaster database/        # Database schema files
├── create_env.ps1               # Root environment setup script
├── SETUP_ENV.md                 # Environment setup guide
├── INTEGRATION_GUIDE.md         # Integration documentation
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** - Backend runtime
- **Node.js 16+** and **npm** - Frontend build tools
- **MySQL 8.0+** - Database server
- **Gmail Account** - For OTP email service (with App Password)

### 1. Backend Setup

```bash
# Navigate to backend directory
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

# Create .env file (see Environment Variables section)
# Or use the PowerShell script:
.\create_env.ps1

# Test database connection
python -m app.test

# Test all services
python -m app.test_services

# Start the development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **API Base URL**: `http://localhost:8000`
- **Interactive API Docs**: `http://localhost:8000/docs`
- **Alternative Docs**: `http://localhost:8000/redoc`

### 2. Frontend Setup

```bash
# From project root directory
# Install dependencies
npm install

# Create .env file (see Environment Variables section)
# Or use the PowerShell script:
.\create_env.ps1

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## ⚙️ Environment Variables

See [SETUP_ENV.md](SETUP_ENV.md) for detailed environment variable setup instructions.

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Email Configuration (for OTP service)
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=465

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=StockMaster

# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Alternative: Use DATABASE_URL instead of individual DB variables
# DATABASE_URL=mysql+pymysql://user:password@host:port/database
```

**Important Notes:**
- Use Gmail **App Password**, not your regular Gmail password
- Generate App Password: Google Account → Security → 2-Step Verification → App Passwords
- Keep `.env` file secret and never commit it to version control

### Frontend Environment Variables

Create a `.env` file in the project root directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login (returns JWT token) |
| POST | `/api/v1/auth/logout` | Logout user |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| POST | `/api/v1/auth/password/forgot` | Request password reset (sends OTP) |
| POST | `/api/v1/auth/password/reset` | Reset password with OTP |

### Product Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (with pagination, search, warehouse filter) |
| POST | `/api/v1/products` | Create new product |
| GET | `/api/v1/products/{id}` | Get product details |
| PATCH | `/api/v1/products/{id}` | Update product |
| DELETE | `/api/v1/products/{id}` | Delete product |
| GET | `/api/v1/products_stock` | Get product stock by warehouse |

### Product Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/product-categories` | List categories |
| POST | `/api/v1/product-categories` | Create category |
| GET | `/api/v1/product-categories/{id}` | Get category |
| PATCH | `/api/v1/product-categories/{id}` | Update category |
| DELETE | `/api/v1/product-categories/{id}` | Delete category |

### Warehouse Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/warehouses` | List warehouses |
| POST | `/api/v1/warehouses` | Create warehouse |
| GET | `/api/v1/warehouses/{id}` | Get warehouse details |
| PATCH | `/api/v1/warehouses/{id}` | Update warehouse |
| DELETE | `/api/v1/warehouses/{id}` | Delete warehouse |

### Warehouse Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/warehouse_locations` | List locations (filter by warehouse) |
| POST | `/api/v1/warehouse_locations` | Create location |
| GET | `/api/v1/warehouse_locations/{id}` | Get location details |
| PATCH | `/api/v1/warehouse_locations/{id}` | Update location |
| DELETE | `/api/v1/warehouse_locations/{id}` | Delete location |

### Receipts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/receipts` | List receipts (with filters) |
| POST | `/api/v1/receipts` | Create receipt (Draft status) |
| GET | `/api/v1/receipts/{id}` | Get receipt details |
| PATCH | `/api/v1/receipts/{id}` | Update receipt |
| DELETE | `/api/v1/receipts/{id}` | Delete receipt |
| POST | `/api/v1/receipts/{id}/validate` | Validate receipt (updates stock, sets to Done) |

### Deliveries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/deliveries` | List deliveries (with filters) |
| POST | `/api/v1/deliveries` | Create delivery order |
| GET | `/api/v1/deliveries/{id}` | Get delivery details |
| PATCH | `/api/v1/deliveries/{id}` | Update delivery |

### Transfers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transfers` | List transfers |
| POST | `/api/v1/transfers` | Create transfer |
| GET | `/api/v1/transfers/{id}` | Get transfer details |
| PATCH | `/api/v1/transfers/{id}` | Update transfer |

### Adjustments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/adjustments` | List adjustments |
| POST | `/api/v1/adjustments` | Create adjustment (updates stock immediately) |

### Reports & Ledger

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/stock-summary` | Stock summary across warehouses |
| GET | `/api/v1/reports/low-stock` | Low stock report |
| GET | `/api/v1/ledger` | Stock movement ledger (with filters) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health check |

**Note:** Most endpoints require JWT authentication. Include the token in the `Authorization` header: `Bearer <token>`

## 🎨 Frontend Pages

- **Dashboard** (`/dashboard`) - Overview with KPIs and metrics
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Reset Password** (`/reset-password`) - Password reset with OTP
- **Products** (`/products`) - Product management and listing
- **Categories** (`/categories`) - Product category management
- **Warehouses** (`/warehouses`) - Warehouse management
- **Locations** (`/locations`) - Warehouse location management
- **Stock** (`/stock`) - Stock overview and tracking
- **Receipts** (`/receipts`) - Incoming stock receipts
- **Delivery** (`/delivery`) - Outgoing deliveries
- **Move History** (`/move-history`) - Stock movement ledger
- **Settings** (`/settings`) - Application settings
- **Profile** (`/profile`) - User profile management
- **Notifications** (`/notifications`) - System notifications

## 🗄️ Database Schema

The system uses MySQL with the following main tables:

- **users** - User accounts and authentication
- **otps** - OTP storage for password reset
- **products** - Product master data
- **product_categories** - Product categorization
- **warehouses** - Warehouse information
- **warehouse_locations** - Locations within warehouses
- **receipts** - Incoming stock receipts
- **receipt_items** - Receipt line items
- **deliveries** - Outgoing deliveries
- **delivery_items** - Delivery line items
- **transfers** - Inter-warehouse transfers
- **transfer_items** - Transfer line items
- **adjustments** - Stock adjustments
- **adjustment_items** - Adjustment line items
- **stock_snapshot** - Current stock levels (on_hand, reserved)
- **stock_moves** - Stock movement ledger/audit trail

See `stockMaster database/stockmaster.sql` for complete schema definition.

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Test database connection
python -m app.test

# Comprehensive service tests
python -m app.test_services
```

The test suite validates:
- Configuration loading
- Database connectivity
- Database table structure
- OTP generation
- Email service (optional)
- API endpoints (requires running server)

### Frontend Testing

```bash
# Run React test suite
npm test
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based sessions
- **Argon2 Password Hashing** - Industry-standard password security
- **OTP Expiration** - Time-limited OTP codes (5 minutes default)
- **Password Requirements** - Enforced strong passwords:
  - Minimum 8 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one special character
- **CORS Configuration** - Configurable cross-origin resource sharing
- **SQL Injection Protection** - Parameterized queries
- **Input Validation** - Pydantic models for request validation

## 📦 Key Dependencies

### Backend
- `fastapi>=0.110.0` - Web framework
- `uvicorn[standard]>=0.23.0` - ASGI server
- `pydantic>=2.5.0` - Data validation
- `mysql-connector-python` - MySQL driver
- `python-jose[cryptography]` - JWT handling
- `argon2-cffi` - Password hashing
- `python-dotenv>=1.0` - Environment management
- `email-validator>=2.0` - Email validation

### Frontend
- `react@^19.2.0` - UI library
- `@mui/material@^7.3.5` - Material-UI components
- `@mui/icons-material@^7.3.5` - Material icons
- `react-router-dom@^7.9.6` - Routing
- `@mui/x-data-grid@^8.19.0` - Data grid component

## 🚢 Deployment Considerations

### Backend
- Use production ASGI server (Gunicorn with Uvicorn workers)
- Set secure `SECRET_KEY` in production
- Use environment variables for all sensitive data
- Configure proper CORS origins
- Set up database connection pooling
- Use Redis for OTP storage in production (currently in-memory)
- Enable HTTPS/TLS
- Set up proper logging and monitoring

### Frontend
- Build production bundle: `npm run build`
- Serve static files through web server (Nginx, Apache)
- Configure API URL for production environment
- Enable compression and caching
- Set up proper error tracking

### Database
- Regular backups
- Proper indexing on frequently queried columns
- Connection pooling configuration
- Query optimization
- Database replication for high availability

## 📝 API Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 25
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔄 Status Workflows

### Receipt Status Flow
```
Draft → Waiting → Ready → Done
```

### Delivery Status Flow
```
Draft → Waiting → Ready → Done
```

### Transfer Status Flow
```
Draft → Waiting → Ready → Done
```

## 📚 Additional Documentation

- [SETUP_ENV.md](SETUP_ENV.md) - Detailed environment setup guide
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - API integration guide
- [backend/README.md](backend/README.md) - Backend-specific documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

For issues and questions:
- Check the documentation files
- Review API documentation at `/docs` endpoint
- Open an issue on the repository

---

**Stock Master** - Comprehensive Inventory Management System
