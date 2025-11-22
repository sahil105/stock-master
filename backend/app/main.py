"""
FastAPI StockMaster Inventory Management System - Aligned with OpenAPI Spec
"""

from fastapi import FastAPI, Depends, HTTPException, status, Query, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, UTC, timedelta
from jose import jwt, JWTError
from enum import Enum

from typing import Optional, List
from datetime import datetime, timedelta, UTC
from jose import JWTError, jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv
import random
import string
# bcrypt import removed - using Argon2 instead
# import bcrypt

load_dotenv()

# =========================
# CONFIGURATION
# =========================
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
OTP_EXPIRE_MINUTES = 5

# =========================
# DATABASE CONFIGURATION
# =========================
def parse_db_host(host_str: str) -> tuple[str, int]:
    """Parse DB_HOST to extract hostname and port, handling tcp:// prefix"""
    if not host_str:
        return "localhost", 3306
    host_str = host_str.replace("tcp://", "").replace("TCP://", "").replace("Tcp://", "")
    if ":" in host_str:
        host, port_str = host_str.rsplit(":", 1)
        try:
            port = int(port_str)
            return host, port
        except ValueError:
            return host_str, int(os.getenv("DB_PORT", 3306))
    return host_str, int(os.getenv("DB_PORT", 3306))

db_host, db_port = parse_db_host(os.getenv("DB_HOST", "localhost"))

DB_CONFIG = {
    "host": db_host,
    "port": db_port,
    "user": os.getenv("DB_USER", "team_maven"),
    "password": os.getenv("DB_PASSWORD", "maven@123"),
    "database": os.getenv("DB_NAME", "StockMaster"),
    "pool_name": "mypool",
    "pool_size": 10
}

# Initialize connection pool
connection_pool = pooling.MySQLConnectionPool(**DB_CONFIG)

# =========================
# PASSWORD HASHING (Argon2)
# =========================
ph = PasswordHasher()

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False

# =========================
# JWT AUTH
# =========================
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# =========================
# FASTAPI INIT
# =========================
app = FastAPI(
    title="StockMaster Inventory Management System",
    version="1.0.2",
    description="API for Inventory Tracking, Stock Movements, Receipts, Deliveries, Transfers, and Adjustments"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory OTP storage (use Redis in production)
otp_storage = {}

# ============================================
# ENUMS
# ============================================

class StatusEnum(str, Enum):
    DRAFT = "Draft"
    WAITING = "Waiting"
    READY = "Ready"
    DONE = "Done"
    CANCELED = "Canceled"

class OperationType(str, Enum):
    STANDARD = "Standard Delivery"
    EXPRESS = "Express Delivery"
    BULK = "Bulk Delivery"

class MovementType(str, Enum):
    RECEIPT = "receipt"
    DELIVERY = "delivery"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjustment"

# ============================================
# DATABASE HELPER
# ============================================

def get_db():
    """Get database connection from pool"""
    conn = connection_pool.get_connection()
    try:
        yield conn
    finally:
        # Return connection to pool
        # Note: Ensure all cursors are closed and results consumed before this point
        conn.close()

# ============================================
# PYDANTIC MODELS
# ============================================

class ApiResponse(BaseModel):
    """Base API response wrapper"""
    meta: Optional[Dict[str, int]] = None

class ErrorValidation(BaseModel):
    field: str
    message: str

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: Optional[List[ErrorValidation]] = None

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    user_id: str = Field(..., min_length=6, max_length=12)  # Login ID must be 6-12 characters

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordForgotRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    token: str
    email: EmailStr
    password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str

class UserInfo(BaseModel):
    id: int
    email: str
    user_id: str

# Product Category Models (Updated: removed description and is_active to match Schema)
class ProductCategoryCreate(BaseModel):
    name: str

class ProductCategoryUpdate(BaseModel):
    name: Optional[str] = None

class ProductCategory(BaseModel):
    id: int
    name: str
    created_at: datetime

# Product Models (Updated: warehouse_id -> warehouse_location_id to match Schema)
class ProductCreate(BaseModel):
    name: str
    sku: str
    category_id: int
    uom: str
    warehouse_location_id: int  # Changed from warehouse_id
    reorder_level: int

class ProductUpdate(BaseModel):
    name: str
    sku: str
    category_id: int
    uom: str
    warehouse_location_id: int  # Changed from warehouse_id
    reorder_level: int

class Product(BaseModel):
    id: int
    name: str
    sku: str
    category_id: int
    uom: str
    warehouse_location_id: int  # Changed from warehouse_id
    reorder_level: int
    created_at: datetime

class StockByWarehouse(BaseModel):
    quantity: float  # Changed from on_hand to quantity (Schema uses quantity)
    reserved: float = 0  # Default to 0 as Schema may not have reserved column
    free_to_use: float  # Calculated field

class ProductStock(Product):
    stock_by_warehouse: StockByWarehouse

# Warehouse Models
class WarehouseCreate(BaseModel):
    name: str
    code: str
    address: Optional[str] = None

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None

class Warehouse(BaseModel):
    id: int
    name: str
    code: str
    address: Optional[str] = None
    created_at: datetime

# Warehouse Location Models
class WarehouseLocationCreate(BaseModel):
    warehouse_id: int
    name: str
    code: str

class WarehouseLocationUpdate(BaseModel):
    warehouse_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None

class WarehouseLocation(BaseModel):
    id: int
    warehouse_id: int
    name: str
    code: str
    created_at: datetime

# Receipt Models (Updated: qty -> quantity to match Schema)
class ReceiptItemCreate(BaseModel):
    product_id: int
    quantity: float  # Changed from qty to quantity

class ReceiptCreate(BaseModel):
    vendor_name: str
    warehouse_id: int
    ref_no: str
    contact: str
    remarks: Optional[str] = None
    schedule_at: Optional[datetime] = None
    status: StatusEnum = StatusEnum.DRAFT
    items: List[ReceiptItemCreate]

class ReceiptUpdate(BaseModel):
    vendor_name: Optional[str] = None
    warehouse_id: Optional[int] = None
    contact: Optional[str] = None
    status: Optional[StatusEnum] = None
    remarks: Optional[str] = None
    schedule_at: Optional[datetime] = None
    items: Optional[List[ReceiptItemCreate]] = None

class Receipt(BaseModel):
    id: int
    vendor_name: str
    warehouse_id: int
    ref_no: str  # Schema uses ref_no, mapped from document_no
    contact: str
    remarks: Optional[str] = None
    schedule_at: Optional[datetime] = None
    status: StatusEnum
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    items: Optional[List[ReceiptItemCreate]] = None

# Delivery Models (Updated: qty -> quantity to match Schema)
class DeliveryItemCreate(BaseModel):
    product_id: int
    quantity: float  # Changed from qty to quantity

class DeliveryCreate(BaseModel):
    customer_name: str
    address: str
    warehouse_id: int
    ref_no: str
    contact: str
    schedule_at: Optional[datetime] = None
    remarks: Optional[str] = None
    operation_type: OperationType
    status: StatusEnum = StatusEnum.DRAFT
    items: List[DeliveryItemCreate]

class DeliveryUpdate(BaseModel):
    customer_name: Optional[str] = None
    address: Optional[str] = None
    warehouse_id: Optional[int] = None
    schedule_at: Optional[datetime] = None
    ref_no: Optional[str] = None
    remarks: Optional[str] = None
    operation_type: Optional[OperationType] = None
    status: Optional[StatusEnum] = None
    items: Optional[List[DeliveryItemCreate]] = None

class Delivery(BaseModel):
    id: int
    customer_name: str
    address: str
    warehouse_id: int
    schedule_at: Optional[datetime] = None
    ref_no: str
    remarks: Optional[str] = None
    operation_type: OperationType
    status: StatusEnum
    created_by: int
    created_at: datetime
    confirmed_at: Optional[datetime] = None

# Transfer Models (Updated: qty -> quantity to match Schema)
class TransferItemCreate(BaseModel):
    product_id: int
    quantity: float  # Changed from qty to quantity

class TransferCreate(BaseModel):
    warehouse_from: int
    warehouse_to: int
    ref_no: Optional[str] = None
    remarks: Optional[str] = None
    status: StatusEnum = StatusEnum.DRAFT
    items: List[TransferItemCreate]

class TransferUpdate(BaseModel):
    warehouse_from: Optional[int] = None
    warehouse_to: Optional[int] = None
    ref_no: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[StatusEnum] = None
    items: Optional[List[TransferItemCreate]] = None

class Transfer(BaseModel):
    id: int
    warehouse_from: int
    warehouse_to: int
    ref_no: Optional[str] = None
    remarks: Optional[str] = None
    status: StatusEnum

# Adjustment Models (Updated: Match new payload structure with items array)
class AdjustmentItemCreate(BaseModel):
    product_id: int
    quantity: float  # Can be positive or negative

class AdjustmentCreate(BaseModel):
    warehouse_id: int
    reason: str
    status: StatusEnum = StatusEnum.DRAFT
    items: List[AdjustmentItemCreate]  # Changed to items array structure

class AdjustmentItem(BaseModel):
    product_id: int
    quantity: float

class Adjustment(BaseModel):
    id: int
    warehouse_id: int
    reason: str
    status: str
    created_by: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    items: List[AdjustmentItem]  # Items array

# Ledger Models (Updated: Use stock_moves table structure)
class LedgerEntry(BaseModel):
    id: int
    product_id: int
    move_type: str  # Changed from movement_type to move_type (Schema)
    quantity: float  # Changed from qty to quantity
    from_warehouse_id: Optional[int] = None  # Changed from warehouse_from
    to_warehouse_id: Optional[int] = None  # Changed from warehouse_to
    reference_id: Optional[int] = None  # Changed from document_ref (Schema uses reference_id as int)
    created_at: datetime  # Changed from movement_at to created_at

# ============================================
# UTILITY FUNCTIONS
# ============================================

# Note: hash_password and verify_password are already defined above using Argon2
# These duplicates are removed to prevent conflicts

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), conn = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Unauthorized request")
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, email, user_id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        
        if user is None:
            raise HTTPException(status_code=401, detail="Unauthorized request")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized request")

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.post("/api/v1/auth/login", response_model=Dict[str, Any], tags=["Auth"])
def login(user: UserLogin, conn = Depends(get_db)):
    """Login and generate JWT token"""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
        db_user = cursor.fetchone()
    finally:
        cursor.close()
    
    # Check for Login Credentials - Match creds, and allow to login a user
    # If Creds does not match throw an error msg, "Invalid Login Id or Password"
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid Login Id or Password")
    
    token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "data": {
            "token": token,
            "user": {
                "id": db_user["id"],
                "name": db_user.get("user_id", ""),
                "email": db_user["email"],
                "role": db_user.get("role", "user")
            }
        }
    }

@app.post("/api/v1/auth/logout", tags=["Auth"])
def logout(current_user: dict = Depends(get_current_user)):
    """Logout user"""
    return {"success": True, "message": "Logged out successfully"}

@app.post("/api/v1/auth/refresh", tags=["Auth"])
def refresh_token(current_user: dict = Depends(get_current_user)):
    """Refresh JWT token"""
    token = create_access_token(
        data={"sub": current_user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"data": {"token": token}}

@app.post("/api/v1/auth/password/forgot", tags=["Auth"])
def forgot_password(request: PasswordForgotRequest, conn = Depends(get_db)):
    """Request password reset (send reset link/email)"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (request.email,))
    user = cursor.fetchone()
    cursor.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate reset token (in production, store in DB and send via email)
    reset_token = generate_otp(32)
    print(f"Password reset token for {request.email}: {reset_token}")
    
    return {
        "success": True,
        "message": "Password reset link sent to email"
    }

@app.post("/api/v1/auth/password/reset", tags=["Auth"])
def reset_password(request: PasswordResetRequest, conn = Depends(get_db)):
    """Reset user password using token"""
    # In production, verify token from database
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s", (request.email,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            raise HTTPException(status_code=400, detail="Invalid token or email")
        
        # Validate password: must contain lowercase, uppercase, special character, and be > 8 characters
        password_errors = []
        if len(request.password) < 8:
            password_errors.append("Password must be at least 8 characters long")
        if not any(c.islower() for c in request.password):
            password_errors.append("Password must contain at least one lowercase letter")
        if not any(c.isupper() for c in request.password):
            password_errors.append("Password must contain at least one uppercase letter")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in request.password):
            password_errors.append("Password must contain at least one special character")
        
        if password_errors:
            cursor.close()
            raise HTTPException(status_code=422, detail="; ".join(password_errors))
        
        # Update password
        hashed_pw = hash_password(request.password)
        cursor.execute("UPDATE users SET password_hash = %s WHERE email = %s", (hashed_pw, request.email))
        conn.commit()
    finally:
        cursor.close()
    
    return {
        "success": True,
        "message": "Password has been reset successfully"
    }

@app.post("/api/v1/auth/register", response_model=Dict[str, Any], tags=["Auth"])
def register(user: UserRegister, conn = Depends(get_db)):
    """Create a user database into the system on signup with credential checks"""
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check creds as follows:
        # 1. Login ID should be unique and must be in between 6-12 characters
        if len(user.user_id) < 6 or len(user.user_id) > 12:
            raise HTTPException(
                status_code=422,
                detail="Login ID must be between 6 and 12 characters"
            )
        
        # Check if login ID already exists
        cursor.execute("SELECT id FROM users WHERE user_id = %s", (user.user_id,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=422,
                detail="Login ID already exists. Please choose a different one."
            )
        
        # 2. Email Id should not be a duplicate in database
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=422,
                detail="Email already exists. Please use a different email."
            )
        
        # 3. Password must be unique and must contain a small case, a large case and a special character and length should be in more than 8 characters
        password_errors = []
        if len(user.password) < 8:
            password_errors.append("Password must be at least 8 characters long")
        if not any(c.islower() for c in user.password):
            password_errors.append("Password must contain at least one lowercase letter")
        if not any(c.isupper() for c in user.password):
            password_errors.append("Password must contain at least one uppercase letter")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in user.password):
            password_errors.append("Password must contain at least one special character")
        
        if password_errors:
            raise HTTPException(status_code=422, detail="; ".join(password_errors))
        
        # Create user
        hashed_pw = hash_password(user.password)
        cursor.execute(
            "INSERT INTO users (email, password_hash, user_id, created_at) VALUES (%s, %s, %s, NOW())",
            (user.email, hashed_pw, user.user_id)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        # Return user data
        cursor.execute("SELECT id, email, user_id FROM users WHERE id = %s", (user_id,))
        new_user = cursor.fetchone()
        
        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "id": new_user["id"],
                "email": new_user["email"],
                "user_id": new_user["user_id"]
            }
        }
        
    except HTTPException:
        raise
    except mysql.connector.IntegrityError as e:
        if "Duplicate entry" in str(e):
            if "user_id" in str(e):
                raise HTTPException(status_code=422, detail="Login ID already exists")
            elif "email" in str(e):
                raise HTTPException(status_code=422, detail="Email already exists")
        raise HTTPException(status_code=422, detail="Registration failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")
    finally:
        cursor.close()

# ============================================
# PRODUCT CATEGORIES ENDPOINTS
# ============================================

@app.get("/api/v1/product-categories", tags=["ProductCategories"])
def list_product_categories(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """List product categories (supports search & pagination)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    if search:
        query = "SELECT * FROM product_categories WHERE name LIKE %s LIMIT %s OFFSET %s"
        cursor.execute(query, (f"%{search}%", limit, offset))
        categories = cursor.fetchall()
        count_query = "SELECT COUNT(*) as total FROM product_categories WHERE name LIKE %s"
        cursor.execute(count_query, (f"%{search}%",))
        total = cursor.fetchone()["total"]
    else:
        cursor.execute("SELECT * FROM product_categories LIMIT %s OFFSET %s", (limit, offset))
        categories = cursor.fetchall()
        cursor.execute("SELECT COUNT(*) as total FROM product_categories")
        total = cursor.fetchone()["total"]
    
    cursor.close()
    
    return {
        "data": categories,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.post("/api/v1/product-categories", status_code=201, tags=["ProductCategories"])
def create_product_category(
    category: ProductCategoryCreate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Create new product category (Updated: Only inserting 'name' based on new Schema)"""
    cursor = conn.cursor()
    try:
        # Check if category name already exists before attempting insert
        cursor.execute("SELECT id FROM product_categories WHERE name = %s", (category.name,))
        if cursor.fetchone():
            cursor.close()
            raise HTTPException(
                status_code=400, 
                detail=f"Category with name '{category.name}' already exists. Please use a different name."
            )
        
        # Updated: Only inserting 'name' based on new Schema (removed description and is_active)
        cursor.execute(
            "INSERT INTO product_categories (name, created_at) VALUES (%s, NOW())",
            (category.name,)
        )
        conn.commit()
        category_id = cursor.lastrowid
        cursor.close()
        
        return {"data": {"id": category_id, "name": category.name}}
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code=422, detail="Category name already exists")

@app.get("/api/v1/product-categories/{id}", tags=["ProductCategories"])
def get_product_category(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Get product category by id"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM product_categories WHERE id = %s", (id,))
    category = cursor.fetchone()
    cursor.close()
    
    if not category:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": category}

@app.patch("/api/v1/product-categories/{id}", tags=["ProductCategories"])
def update_product_category(
    id: int,
    category: ProductCategoryUpdate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Update product category (Updated: Only updating 'name' based on new Schema)"""
    cursor = conn.cursor(dictionary=True)
    
    if category.name is None:
        raise HTTPException(status_code=422, detail="No fields to update")
    
    # Updated: Only updating 'name' (removed description and is_active)
    cursor.execute(
        "UPDATE product_categories SET name = %s WHERE id = %s",
        (category.name, id)
    )
    conn.commit()
    
    cursor.execute("SELECT * FROM product_categories WHERE id = %s", (id,))
    updated = cursor.fetchone()
    cursor.close()
    
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": updated}

@app.delete("/api/v1/product-categories/{id}", status_code=204, tags=["ProductCategories"])
def delete_product_category(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Delete product category (soft-delete recommended)"""
    cursor = conn.cursor()
    cursor.execute("DELETE FROM product_categories WHERE id = %s", (id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    conn.commit()
    cursor.close()
    return None

# ============================================
# PRODUCTS ENDPOINTS
# ============================================

@app.get("/api/v1/products", tags=["Products"])
def list_products(
    warehouse_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """List products (Fix: Joins warehouse_locations to filter by warehouse_id)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    conditions = []
    params = []
    
    # BASE QUERY: Join with warehouse_locations to allow filtering by warehouse_id
    base_query = """
        FROM products p
        LEFT JOIN warehouse_locations wl ON p.warehouse_location_id = wl.id
    """
    
    if warehouse_id:
        # Filter by warehouse_id (which is in warehouse_locations table)
        conditions.append("wl.warehouse_id = %s")
        params.append(warehouse_id)
    
    if search:
        conditions.append("(p.name LIKE %s OR p.sku LIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Execute and fetch products first
    query = f"SELECT p.* {base_query} {where_clause} LIMIT %s OFFSET %s"
    query_params = params.copy()
    query_params.extend([limit, offset])
    cursor.execute(query, query_params)
    products = cursor.fetchall()
    
    # Then execute and fetch count
    count_query = f"SELECT COUNT(*) as total {base_query} {where_clause}"
    count_params = params.copy()
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]
    cursor.close()
    
    return {
        "data": products,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.post("/api/v1/products", status_code=201, tags=["Products"])
def create_product(
    product: ProductCreate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Create new product (Updated to use warehouse_location_id)"""
    cursor = conn.cursor()
    try:
        # Updated to use warehouse_location_id
        cursor.execute(
            """INSERT INTO products (name, sku, category_id, uom, warehouse_location_id, reorder_level, created_at)
               VALUES (%s, %s, %s, %s, %s, %s, NOW())""",
            (product.name, product.sku, product.category_id, product.uom, 
             product.warehouse_location_id, product.reorder_level)
        )
        conn.commit()
        product_id = cursor.lastrowid
        cursor.close()
        return {"data": {"id": product_id}}
    except mysql.connector.IntegrityError as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=422, detail="SKU already exists")
        raise HTTPException(status_code=422, detail="Validation error")

@app.patch("/api/v1/products/{id}", tags=["Products"])
def update_product(
    id: int,
    product: ProductUpdate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Update product (Updated columns to use warehouse_location_id)"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """UPDATE products SET name=%s, sku=%s, category_id=%s, uom=%s, 
           warehouse_location_id=%s, reorder_level=%s, updated_at=NOW() WHERE id=%s""",
        (product.name, product.sku, product.category_id, product.uom,
         product.warehouse_location_id, product.reorder_level, id)
    )
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    conn.commit()
    cursor.execute("SELECT * FROM products WHERE id = %s", (id,))
    updated = cursor.fetchone()
    cursor.close()
    
    return {"data": updated}

@app.delete("/api/v1/products/{id}", status_code=204, tags=["Products"])
def delete_product(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Delete product"""
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = %s", (id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    conn.commit()
    cursor.close()
    return None

from collections import defaultdict

@app.get("/api/v1/products_stock", tags=["Products"])
def get_product_stock(
    search: Optional[str] = Query(None),
    conn = Depends(get_db)
):
    """
    Get product stock grouped by product, listing details per warehouse.
    Uses the 'on_hand' and 'reserved' columns from your schema.
    """
    cursor = conn.cursor(dictionary=True)
    
    # 1. Build Query conditions
    conditions = []
    params = []
    
    if search:
        conditions.append("(p.name LIKE %s OR p.sku LIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
        
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    # 2. Fetch Data (Join Products, Stock Snapshot, and Warehouses)
    # We use COALESCE to handle cases where a product has no stock entry yet (returns 0)
    query = f"""
        SELECT 
            p.id as product_id,
            p.name as product_name,
            p.sku,
            w.id as warehouse_id,
            w.name as warehouse_name,
            COALESCE(ss.on_hand, 0) as on_hand,
            COALESCE(ss.reserved, 0) as reserved
        FROM products p
        JOIN stock_snapshot ss ON p.id = ss.product_id
        JOIN warehouses w ON ss.warehouse_id = w.id
        {where_clause}
        ORDER BY p.id, w.id
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()

    # 3. Python Grouping Logic
    # We use a dictionary to group flat SQL rows into nested objects
    grouped_stock = defaultdict(lambda: {
        "product_id": None, 
        "product_name": None, 
        "sku": None,
        "stock_by_warehouse": []
    })

    for row in rows:
        pid = row["product_id"]
        
        # Initialize product info if seen for the first time
        if grouped_stock[pid]["product_id"] is None:
            grouped_stock[pid]["product_id"] = row["product_id"]
            grouped_stock[pid]["product_name"] = row["product_name"]
            grouped_stock[pid]["sku"] = row["sku"]
        
        # Calculate Free to Use
        on_hand = float(row["on_hand"])
        reserved = float(row["reserved"])
        free_to_use = on_hand - reserved
        
        # Append warehouse detail
        grouped_stock[pid]["stock_by_warehouse"].append({
            "warehouse_id": row["warehouse_id"],
            "warehouse_name": row["warehouse_name"],
            "on_hand": on_hand,
            "reserved": reserved,
            "free_to_use": free_to_use
        })

    # 4. Convert dictionary values to a list for the JSON response
    return {"data": list(grouped_stock.values())}

# ============================================
# RECEIPTS ENDPOINTS
# ============================================

@app.post("/api/v1/receipts", status_code=201, tags=["Receipts"])
def create_receipt(
    receipt: ReceiptCreate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Create receipt (Draft) (Updated to use ref_no and quantity)"""
    cursor = conn.cursor()
    
    # Use ref_no if provided, otherwise generate one
    ref_no = receipt.ref_no or f"RCPT-{datetime.now().year}-{random.randint(1000, 9999)}"
    
    cursor.execute(
        """INSERT INTO receipts (vendor_name, warehouse_id, ref_no, contact, remarks, schedule_at, status, created_by, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())""",
        (receipt.vendor_name, receipt.warehouse_id, ref_no, receipt.contact,
         receipt.remarks, receipt.schedule_at, receipt.status.value, current_user["id"])
    )
    receipt_id = cursor.lastrowid
    
    for item in receipt.items:
        # Updated: Use quantity instead of qty
        cursor.execute(
            "INSERT INTO receipt_items (receipt_id, product_id, quantity) VALUES (%s, %s, %s)",
            (receipt_id, item.product_id, item.quantity)
        )
    
    conn.commit()
    cursor.close()
    return {"data": {"id": receipt_id}}

@app.get("/api/v1/receipts", tags=["Receipts"])
def list_receipts(
    warehouse_id: Optional[int] = Query(None),
    status: Optional[StatusEnum] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """List all receipts (supports search, status filter & pagination)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    conditions = []
    params = []
    
    if warehouse_id:
        conditions.append("warehouse_id = %s")
        params.append(warehouse_id)
    
    if status:
        conditions.append("status = %s")
        params.append(status.value)
    
    if search:
        # Updated: Use ref_no instead of document_no
        conditions.append("(vendor_name LIKE %s OR ref_no LIKE %s OR contact LIKE %s)")
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Execute and fetch receipts first
    query = f"SELECT * FROM receipts{where_clause} ORDER BY created_at DESC LIMIT %s OFFSET %s"
    query_params = params.copy()
    query_params.extend([limit, offset])
    cursor.execute(query, query_params)
    receipts = cursor.fetchall()
    
    # Fetch items for each receipt
    for receipt in receipts:
        cursor.execute("SELECT product_id, quantity FROM receipt_items WHERE receipt_id = %s", (receipt["id"],))
        receipt["items"] = cursor.fetchall()
    
    # Then execute and fetch count
    count_query = f"SELECT COUNT(*) as total FROM receipts{where_clause}"
    count_params = params.copy()
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]
    cursor.close()
    
    return {
        "data": receipts,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.patch("/api/v1/receipts/{id}", tags=["Receipts"])
def update_receipt(
    id: int,
    receipt: ReceiptUpdate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Update a receipt (Draft/Waiting/Ready)"""
    cursor = conn.cursor(dictionary=True)
    
    updates = []
    values = []
    
    if receipt.vendor_name:
        updates.append("vendor_name = %s")
        values.append(receipt.vendor_name)
    if receipt.warehouse_id:
        updates.append("warehouse_id = %s")
        values.append(receipt.warehouse_id)
    if receipt.contact:
        updates.append("contact = %s")
        values.append(receipt.contact)
    if receipt.status:
        updates.append("status = %s")
        values.append(receipt.status.value)
    if receipt.remarks:
        updates.append("remarks = %s")
        values.append(receipt.remarks)
    
    if updates:
        values.append(id)
        query = f"UPDATE receipts SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, values)
        conn.commit()
    
    if receipt.items:
        cursor.execute("DELETE FROM receipt_items WHERE receipt_id = %s", (id,))
        for item in receipt.items:
            # Updated: Use quantity instead of qty
            cursor.execute(
                "INSERT INTO receipt_items (receipt_id, product_id, quantity) VALUES (%s, %s, %s)",
                (id, item.product_id, item.quantity)
            )
        conn.commit()
    
    cursor.execute("SELECT * FROM receipts WHERE id = %s", (id,))
    updated = cursor.fetchone()
    cursor.close()
    
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": updated}

@app.delete("/api/v1/receipts/{id}", status_code=204, tags=["Receipts"])
def delete_receipt(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Delete a receipt (soft-delete recommended)"""
    cursor = conn.cursor()
    cursor.execute("DELETE FROM receipts WHERE id = %s", (id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    conn.commit()
    cursor.close()
    return None

@app.post("/api/v1/receipts/{id}/validate", tags=["Receipts"])
def validate_receipt(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Validate receipt and increase stock (moves to Done) (Updated to use quantity and stock_moves)"""
    cursor = conn.cursor(dictionary=True)
    
    # Get receipt
    cursor.execute("SELECT * FROM receipts WHERE id = %s", (id,))
    receipt = cursor.fetchone()
    
    if not receipt:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if receipt["status"] == "Done":
        raise HTTPException(status_code=422, detail="Receipt already validated")
    
    # Get receipt items (Updated: Use quantity instead of qty)
    cursor.execute("SELECT * FROM receipt_items WHERE receipt_id = %s", (id,))
    items = cursor.fetchall()
    
    # Update stock and log movement
    for item in items:
        # 1. Update Stock Snapshot (quantity) - Updated to use quantity
        cursor.execute(
            """INSERT INTO stock_snapshot (product_id, warehouse_id, quantity, last_updated)
               VALUES (%s, %s, %s, NOW())
               ON DUPLICATE KEY UPDATE quantity = quantity + %s, last_updated = NOW()""",
            (item["product_id"], receipt["warehouse_id"], item["quantity"], item["quantity"])
        )
        
        # 2. Insert into Stock Moves (Schema Ledger) - Updated to use stock_moves table
        cursor.execute(
            """INSERT INTO stock_moves (product_id, move_type, quantity, to_warehouse_id, reference_id, created_at)
               VALUES (%s, 'receipt', %s, %s, %s, NOW())""",
            (item["product_id"], item["quantity"], receipt["warehouse_id"], id)
        )
    
    # Update receipt status
    cursor.execute(
        "UPDATE receipts SET status = 'Done', completed_at = NOW(), updated_at = NOW() WHERE id = %s",
        (id,)
    )
    
    conn.commit()
    
    cursor.execute("SELECT * FROM receipts WHERE id = %s", (id,))
    updated = cursor.fetchone()
    cursor.close()
    
    return {"data": updated}

# ============================================
# DELIVERIES ENDPOINTS
# ============================================

@app.post("/api/v1/deliveries", status_code=201, tags=["Deliveries"])
def create_delivery(
    delivery: DeliveryCreate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Create delivery order (Draft)"""
    cursor = conn.cursor()
    document_no = f"DEL-{datetime.now().year}-{random.randint(1000, 9999)}"
    
    cursor.execute(
        """INSERT INTO deliveries (customer_name, address, warehouse_id, schedule_at, 
           ref_no, remarks, operation_type, status, created_by)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (delivery.customer_name, delivery.address, delivery.warehouse_id,
         delivery.schedule_at, delivery.ref_no, delivery.remarks,
         delivery.operation_type.value, delivery.status.value, current_user["id"])
    )
    delivery_id = cursor.lastrowid
    
    for item in delivery.items:
        # Updated: Use quantity instead of qty
        cursor.execute(
            "INSERT INTO delivery_items (delivery_id, product_id, quantity) VALUES (%s, %s, %s)",
            (delivery_id, item.product_id, item.quantity)
        )
    
    conn.commit()
    cursor.close()
    return {"data": {"id": delivery_id}}

@app.get("/api/v1/deliveries", tags=["Deliveries"])
def list_deliveries(
    warehouse_id: Optional[int] = Query(None),
    status: Optional[StatusEnum] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """List all deliveries (supports search, status filter & pagination)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    conditions = []
    params = []
    
    if warehouse_id:
        conditions.append("warehouse_id = %s")
        params.append(warehouse_id)
    
    if status:
        conditions.append("status = %s")
        params.append(status.value)
    
    if search:
        conditions.append("(customer_name LIKE %s OR ref_no LIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Execute and fetch deliveries first
    query = f"SELECT * FROM deliveries{where_clause} LIMIT %s OFFSET %s"
    query_params = params.copy()
    query_params.extend([limit, offset])
    cursor.execute(query, query_params)
    deliveries = cursor.fetchall()
    
    # Then execute and fetch count
    count_query = f"SELECT COUNT(*) as total FROM deliveries{where_clause}"
    count_params = params.copy()
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]
    cursor.close()
    
    return {
        "data": deliveries,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.get("/api/v1/deliveries/{id}", tags=["Deliveries"])
def get_delivery(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Get delivery by ID"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM deliveries WHERE id = %s", (id,))
    delivery = cursor.fetchone()
    
    if not delivery:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    cursor.execute("SELECT * FROM delivery_items WHERE delivery_id = %s", (id,))
    items = cursor.fetchall()
    delivery["items"] = items
    
    cursor.close()
    return {"data": delivery}

@app.patch("/api/v1/deliveries/{id}", tags=["Deliveries"])
def update_delivery(
    id: int,
    delivery: DeliveryUpdate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Update a delivery (Draft/Waiting/Ready)"""
    cursor = conn.cursor(dictionary=True)
    
    updates = []
    values = []
    
    if delivery.customer_name:
        updates.append("customer_name = %s")
        values.append(delivery.customer_name)
    if delivery.address:
        updates.append("address = %s")
        values.append(delivery.address)
    if delivery.warehouse_id:
        updates.append("warehouse_id = %s")
        values.append(delivery.warehouse_id)
    if delivery.schedule_at:
        updates.append("schedule_at = %s")
        values.append(delivery.schedule_at)
    if delivery.ref_no:
        updates.append("ref_no = %s")
        values.append(delivery.ref_no)
    if delivery.remarks:
        updates.append("remarks = %s")
        values.append(delivery.remarks)
    if delivery.operation_type:
        updates.append("operation_type = %s")
        values.append(delivery.operation_type.value)
    if delivery.status:
        updates.append("status = %s")
        values.append(delivery.status.value)
    
    if updates:
        values.append(id)
        query = f"UPDATE deliveries SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, values)
        conn.commit()
    
    if delivery.items:
        cursor.execute("DELETE FROM delivery_items WHERE delivery_id = %s", (id,))
        for item in delivery.items:
            # Updated: Use quantity instead of qty
            cursor.execute(
                "INSERT INTO delivery_items (delivery_id, product_id, quantity) VALUES (%s, %s, %s)",
                (id, item.product_id, item.quantity)
            )
        conn.commit()
    
    cursor.execute("SELECT * FROM deliveries WHERE id = %s", (id,))
    updated = cursor.fetchone()
    cursor.close()
    
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": updated}

# ============================================
# TRANSFERS ENDPOINTS
# ============================================

@app.post("/api/v1/transfers", status_code=201, tags=["Transfers"])
def create_transfer(
    transfer: TransferCreate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Create stock transfer (Draft) (Updated to use from_warehouse_id/to_warehouse_id and quantity)"""
    cursor = conn.cursor()
    document_no = f"TRF-{datetime.now().year}-{random.randint(1000, 9999)}"
    
    # Using Schema column names: from_warehouse_id, to_warehouse_id
    cursor.execute(
        """INSERT INTO transfers (from_warehouse_id, to_warehouse_id, ref_no, remarks, status, created_by, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, NOW())""",
        (transfer.warehouse_from, transfer.warehouse_to, transfer.ref_no or document_no,
         transfer.remarks, transfer.status.value, current_user["id"])
    )
    transfer_id = cursor.lastrowid
    
    for item in transfer.items:
        # Updated: Use quantity instead of qty
        cursor.execute(
            "INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES (%s, %s, %s)",
            (transfer_id, item.product_id, item.quantity)
        )
    
    conn.commit()
    cursor.close()
    return {"data": {"id": transfer_id}}

@app.get("/api/v1/transfers", tags=["Transfers"])
def list_transfers(
    warehouse_from: Optional[int] = Query(None),
    warehouse_to: Optional[int] = Query(None),
    status: Optional[StatusEnum] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """List all stock transfers (supports search, status filter & pagination)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    conditions = []
    params = []
    
    # Map API param to Schema column
    if warehouse_from:
        conditions.append("from_warehouse_id = %s")
        params.append(warehouse_from)
    
    if warehouse_to:
        conditions.append("to_warehouse_id = %s")
        params.append(warehouse_to)
    
    if status:
        conditions.append("status = %s")
        params.append(status.value)
    
    if search:
        conditions.append("ref_no LIKE %s")
        params.append(f"%{search}%")
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Execute and fetch transfers first
    query = f"SELECT * FROM transfers{where_clause} LIMIT %s OFFSET %s"
    query_params = params.copy()
    query_params.extend([limit, offset])
    cursor.execute(query, query_params)
    transfers = cursor.fetchall()
    
    # Then execute and fetch count
    count_query = f"SELECT COUNT(*) as total FROM transfers{where_clause}"
    count_params = params.copy()
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]
    cursor.close()
    
    return {
        "data": transfers,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.get("/api/v1/transfers/{id}", tags=["Transfers"])
def get_transfer(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Get transfer by ID"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM transfers WHERE id = %s", (id,))
    transfer = cursor.fetchone()
    
    if not transfer:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    cursor.execute("SELECT * FROM transfer_items WHERE transfer_id = %s", (id,))
    items = cursor.fetchall()
    transfer["items"] = items
    
    cursor.close()
    return {"data": transfer}

@app.patch("/api/v1/transfers/{id}", tags=["Transfers"])
def update_transfer(
    id: int,
    transfer: TransferUpdate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Update a stock transfer (Draft/Waiting/Ready)"""
    cursor = conn.cursor(dictionary=True)
    
    updates = []
    values = []
    
    # Map to Schema column names
    if transfer.warehouse_from:
        updates.append("from_warehouse_id = %s")
        values.append(transfer.warehouse_from)
    if transfer.warehouse_to:
        updates.append("to_warehouse_id = %s")
        values.append(transfer.warehouse_to)
    if transfer.ref_no:
        updates.append("ref_no = %s")
        values.append(transfer.ref_no)
    if transfer.remarks:
        updates.append("remarks = %s")
        values.append(transfer.remarks)
    if transfer.status:
        updates.append("status = %s")
        values.append(transfer.status.value)
    
    if updates:
        values.append(id)
        query = f"UPDATE transfers SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, values)
        conn.commit()
    
    if transfer.items:
        cursor.execute("DELETE FROM transfer_items WHERE transfer_id = %s", (id,))
        for item in transfer.items:
            # Updated: Use quantity instead of qty
            cursor.execute(
                "INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES (%s, %s, %s)",
                (id, item.product_id, item.quantity)
            )
        conn.commit()
    
    cursor.execute("SELECT * FROM transfers WHERE id = %s", (id,))
    updated = cursor.fetchone()
    cursor.close()
    
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": updated}

# ============================================
# ADJUSTMENTS ENDPOINTS
# ============================================

@app.post("/api/v1/adjustments", status_code=201, tags=["Adjustments"])
def create_adjustment(
    adjustment: AdjustmentCreate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Create stock adjustment (Updated to match new payload structure with items array)"""
    cursor = conn.cursor(dictionary=True)
    
    # Create adjustment record
    cursor.execute(
        """INSERT INTO adjustments (warehouse_id, reason, status, created_by, created_at)
           VALUES (%s, %s, %s, %s, NOW())""",
        (adjustment.warehouse_id, adjustment.reason, adjustment.status.value, current_user["id"])
    )
    adjustment_id = cursor.lastrowid
    
    # Insert adjustment items
    for item in adjustment.items:
        # Get current system quantity
        cursor.execute(
            """SELECT quantity FROM stock_snapshot 
               WHERE product_id = %s AND warehouse_id = %s""",
            (item.product_id, adjustment.warehouse_id)
        )
        stock = cursor.fetchone()
        system_qty = stock["quantity"] if stock else 0
        
        # Calculate difference (quantity can be positive or negative)
        difference = item.quantity
        
        # Insert adjustment item
        cursor.execute(
            """INSERT INTO adjustment_items (adjustment_id, product_id, quantity)
               VALUES (%s, %s, %s)""",
            (adjustment_id, item.product_id, item.quantity)
        )
        
        # Update stock snapshot (quantity) - Updated to use quantity
        new_quantity = system_qty + item.quantity
        cursor.execute(
            """INSERT INTO stock_snapshot (product_id, warehouse_id, quantity, last_updated)
               VALUES (%s, %s, %s, NOW())
               ON DUPLICATE KEY UPDATE quantity = %s, last_updated = NOW()""",
            (item.product_id, adjustment.warehouse_id, new_quantity, new_quantity)
        )
        
        # Insert into Stock Moves (Schema Ledger) - Updated to use stock_moves
        cursor.execute(
            """INSERT INTO stock_moves (product_id, move_type, quantity, to_warehouse_id, reference_id, created_at)
               VALUES (%s, 'adjustment', %s, %s, %s, NOW())""",
            (item.product_id, item.quantity, adjustment.warehouse_id, adjustment_id)
        )
    
    conn.commit()
    
    # Fetch adjustment with items
    cursor.execute("SELECT * FROM adjustments WHERE id = %s", (adjustment_id,))
    result = cursor.fetchone()
    
    # Fetch adjustment items
    cursor.execute("SELECT product_id, quantity FROM adjustment_items WHERE adjustment_id = %s", (adjustment_id,))
    items = cursor.fetchall()
    result["items"] = items
    
    cursor.close()
    
    return {"data": result}

@app.get("/api/v1/adjustments", tags=["Adjustments"])
def list_adjustments(
    warehouse_id: Optional[int] = Query(None),
    status: Optional[StatusEnum] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """List all adjustments (supports search, status filter & pagination)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    conditions = []
    params = []
    
    if warehouse_id:
        conditions.append("warehouse_id = %s")
        params.append(warehouse_id)
    
    if status:
        conditions.append("status = %s")
        params.append(status.value)
    
    if search:
        conditions.append("reason LIKE %s")
        params.append(f"%{search}%")
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Fetch adjustments
    query = f"SELECT * FROM adjustments{where_clause} ORDER BY created_at DESC LIMIT %s OFFSET %s"
    query_params = params.copy()
    query_params.extend([limit, offset])
    cursor.execute(query, query_params)
    adjustments = cursor.fetchall()
    
    # Fetch items for each adjustment
    for adj in adjustments:
        cursor.execute("SELECT product_id, quantity FROM adjustment_items WHERE adjustment_id = %s", (adj["id"],))
        adj["items"] = cursor.fetchall()
    
    # Count total
    count_query = f"SELECT COUNT(*) as total FROM adjustments{where_clause}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()["total"]
    cursor.close()
    
    return {
        "data": adjustments,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

# ============================================
# REPORTS & LEDGER ENDPOINTS
# ============================================

@app.get("/api/v1/reports/stock-summary", tags=["Reports"])
def get_stock_summary(
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Get stock summary across warehouses"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT p.id, p.name, p.sku, w.name as warehouse_name,
           ss.on_hand, ss.reserved, (ss.on_hand - ss.reserved) as free_to_use
           FROM products p
           JOIN stock_snapshot ss ON p.id = ss.product_id
           JOIN warehouses w ON ss.warehouse_id = w.id"""
    )
    summary = cursor.fetchall()
    cursor.close()
    
    return {"data": summary}

@app.get("/api/v1/reports/low-stock", tags=["Reports"])
def get_low_stock(
    warehouse_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Low stock report (Updated to use ss.quantity)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    where_clause = ""
    params = []
    
    if warehouse_id:
        where_clause = "WHERE ss.warehouse_id = %s"
        params.append(warehouse_id)
    
    # Updated to use ss.quantity
    query = f"""
        SELECT p.*, ss.quantity as on_hand
        FROM products p
        JOIN stock_snapshot ss ON p.id = ss.product_id
        {where_clause}
        HAVING ss.quantity <= p.reorder_level
        LIMIT %s OFFSET %s
    """
    query_params = params.copy()
    query_params.extend([limit, offset])
    cursor.execute(query, query_params)
    low_stock = cursor.fetchall()
    
    # Then execute and fetch count
    count_query = f"""
        SELECT COUNT(*) as total
        FROM products p
        JOIN stock_snapshot ss ON p.id = ss.product_id
        {where_clause}
        HAVING ss.quantity <= p.reorder_level
    """
    count_params = params.copy()
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]
    cursor.close()
    
    return {
        "data": low_stock,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.get("/api/v1/ledger", tags=["Ledger"])
def get_ledger(
    product_id: Optional[int] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    type: Optional[MovementType] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Stock movement ledger (reading from stock_moves table) (Updated to use stock_moves instead of ledger)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    conditions = []
    params = []
    
    if product_id:
        conditions.append("product_id = %s")
        params.append(product_id)
    
    if warehouse_id:
        # Schema uses from_warehouse_id / to_warehouse_id
        conditions.append("(from_warehouse_id = %s OR to_warehouse_id = %s)")
        params.extend([warehouse_id, warehouse_id])
    
    if type:
        conditions.append("move_type = %s")  # Changed from movement_type to move_type
        params.append(type.value)
    
    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    
    # Query stock_moves table (Updated to use stock_moves instead of ledger)
    query = f"SELECT * FROM stock_moves{where_clause} ORDER BY created_at DESC LIMIT %s OFFSET %s"
    query_params = params.copy()
    query_params.extend([limit, offset])
    cursor.execute(query, query_params)
    ledger = cursor.fetchall()
    
    # Then execute and fetch count
    count_query = f"SELECT COUNT(*) as total FROM stock_moves{where_clause}"
    count_params = params.copy()
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]
    cursor.close()
    
    return {
        "data": ledger,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

# ============================================
# WAREHOUSES ENDPOINTS
# ============================================

@app.get("/api/v1/warehouses", tags=["Warehouses"])
def list_warehouses(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """List all warehouses"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    # Execute and fetch warehouses first
    cursor.execute("SELECT * FROM warehouses LIMIT %s OFFSET %s", (limit, offset))
    warehouses = cursor.fetchall()
    
    # Then execute and fetch count
    cursor.execute("SELECT COUNT(*) as total FROM warehouses")
    total = cursor.fetchone()["total"]
    cursor.close()
    
    return {
        "data": warehouses,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.post("/api/v1/warehouses", status_code=201, tags=["Warehouses"])
def create_warehouse(
    warehouse: WarehouseCreate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Create a new warehouse"""
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO warehouses (name, code, address) VALUES (%s, %s, %s)",
        (warehouse.name, warehouse.code, warehouse.address)
    )
    conn.commit()
    warehouse_id = cursor.lastrowid
    cursor.close()
    return {"data": {"id": warehouse_id, "name": warehouse.name}}

@app.get("/api/v1/warehouses/{id}", tags=["Warehouses"])
def get_warehouse(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Get warehouse details"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM warehouses WHERE id = %s", (id,))
    warehouse = cursor.fetchone()
    cursor.close()
    
    if not warehouse:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": warehouse}

@app.patch("/api/v1/warehouses/{id}", tags=["Warehouses"])
def update_warehouse(
    id: int,
    warehouse: WarehouseUpdate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Update warehouse details"""
    cursor = conn.cursor(dictionary=True)
    
    updates = []
    values = []
    
    if warehouse.name:
        updates.append("name = %s")
        values.append(warehouse.name)
    if warehouse.code:
        updates.append("code = %s")
        values.append(warehouse.code)
    if warehouse.address:
        updates.append("address = %s")
        values.append(warehouse.address)
    
    if not updates:
        raise HTTPException(status_code=422, detail="No fields to update")
    
    values.append(id)
    query = f"UPDATE warehouses SET {', '.join(updates)} WHERE id = %s"
    cursor.execute(query, values)
    conn.commit()
    
    cursor.execute("SELECT * FROM warehouses WHERE id = %s", (id,))
    updated = cursor.fetchone()
    cursor.close()
    
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": updated}

@app.delete("/api/v1/warehouses/{id}", status_code=204, tags=["Warehouses"])
def delete_warehouse(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Delete warehouse"""
    cursor = conn.cursor()
    cursor.execute("DELETE FROM warehouses WHERE id = %s", (id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    conn.commit()
    cursor.close()
    return None

# ============================================
# WAREHOUSE LOCATIONS ENDPOINTS
# ============================================

@app.get("/api/v1/warehouse_locations", tags=["Warehouse Locations"])
def list_warehouse_locations(
    warehouse_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """List all warehouse locations (optionally filter by warehouse)"""
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    if warehouse_id:
        # Execute and fetch locations first
        cursor.execute(
            "SELECT * FROM warehouse_locations WHERE warehouse_id = %s LIMIT %s OFFSET %s",
            (warehouse_id, limit, offset)
        )
        locations = cursor.fetchall()
        # Then execute and fetch count
        cursor.execute(
            "SELECT COUNT(*) as total FROM warehouse_locations WHERE warehouse_id = %s",
            (warehouse_id,)
        )
        total = cursor.fetchone()["total"]
    else:
        # Execute and fetch locations first
        cursor.execute("SELECT * FROM warehouse_locations LIMIT %s OFFSET %s", (limit, offset))
        locations = cursor.fetchall()
        # Then execute and fetch count
        cursor.execute("SELECT COUNT(*) as total FROM warehouse_locations")
        total = cursor.fetchone()["total"]
    
    cursor.close()
    
    return {
        "data": locations,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.post("/api/v1/warehouse_locations", status_code=201, tags=["Warehouse Locations"])
def create_warehouse_location(
    location: WarehouseLocationCreate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Create a new warehouse location"""
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO warehouse_locations (warehouse_id, name, code) VALUES (%s, %s, %s)",
        (location.warehouse_id, location.name, location.code)
    )
    conn.commit()
    location_id = cursor.lastrowid
    cursor.close()
    return {"data": {"id": location_id, "name": location.name}}

@app.get("/api/v1/warehouse_locations/{id}", tags=["Warehouse Locations"])
def get_warehouse_location(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Get warehouse location details"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM warehouse_locations WHERE id = %s", (id,))
    location = cursor.fetchone()
    cursor.close()
    
    if not location:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": location}

@app.patch("/api/v1/warehouse_locations/{id}", tags=["Warehouse Locations"])
def update_warehouse_location(
    id: int,
    location: WarehouseLocationUpdate,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Update warehouse location"""
    cursor = conn.cursor(dictionary=True)
    
    updates = []
    values = []
    
    if location.warehouse_id:
        updates.append("warehouse_id = %s")
        values.append(location.warehouse_id)
    if location.name:
        updates.append("name = %s")
        values.append(location.name)
    if location.code:
        updates.append("code = %s")
        values.append(location.code)
    
    if not updates:
        raise HTTPException(status_code=422, detail="No fields to update")
    
    values.append(id)
    query = f"UPDATE warehouse_locations SET {', '.join(updates)} WHERE id = %s"
    cursor.execute(query, values)
    conn.commit()
    
    cursor.execute("SELECT * FROM warehouse_locations WHERE id = %s", (id,))
    updated = cursor.fetchone()
    cursor.close()
    
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"data": updated}

@app.delete("/api/v1/warehouse_locations/{id}", status_code=204, tags=["Warehouse Locations"])
def delete_warehouse_location(
    id: int,
    current_user: dict = Depends(get_current_user),
    conn = Depends(get_db)
):
    """Delete warehouse location"""
    cursor = conn.cursor()
    cursor.execute("DELETE FROM warehouse_locations WHERE id = %s", (id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    conn.commit()
    cursor.close()
    return None

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Warehouse Management System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)