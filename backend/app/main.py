"""
FastAPI Warehouse Management System with JWT Authentication and OTP Validation
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv
import random
import string

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
OTP_EXPIRE_MINUTES = 5

# Database Configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "team_maven"),
    "password": os.getenv("DB_PASSWORD", "maven@123"),
    "database": os.getenv("DB_NAME", "StockMaster"),
    "pool_name": "mypool",
    "pool_size": 10
}

# Initialize connection pool
connection_pool = pooling.MySQLConnectionPool(**DB_CONFIG)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# FastAPI app
app = FastAPI(title="Warehouse Management System", version="1.0.0")

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
# DATABASE HELPER
# ============================================

def get_db():
    """Get database connection from pool"""
    conn = connection_pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()

# ============================================
# PYDANTIC MODELS
# ============================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    user_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProductCreate(BaseModel):
    sku: str
    name: str
    category_id: Optional[int] = None
    uom: str
    warehouse_location_id: Optional[int] = None
    reorder_level: int = 0

class WarehouseCreate(BaseModel):
    name: str
    code: Optional[str] = None
    address: Optional[str] = None

class ReceiptCreate(BaseModel):
    vendor_name: str
    warehouse_id: int
    ref_no: Optional[str] = None
    contact: Optional[str] = None
    remarks: Optional[str] = None
    status: str = "Draft"
    items: List[dict]

class DeliveryCreate(BaseModel):
    customer_name: str
    warehouse_id: int
    ref_no: Optional[str] = None
    remarks: Optional[str] = None
    status: str = "Draft"
    items: List[dict]

class TransferCreate(BaseModel):
    from_warehouse_id: int
    to_warehouse_id: int
    ref_no: Optional[str] = None
    remarks: Optional[str] = None
    status: str = "Draft"
    items: List[dict]

class AdjustmentCreate(BaseModel):
    warehouse_id: int
    reason: Optional[str] = None
    status: str = "Draft"
    items: List[dict]

# ============================================
# UTILITY FUNCTIONS
# ============================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
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
            raise HTTPException(status_code=401, detail="Invalid token")
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, email, user_id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.post("/api/auth/register", response_model=Token)
def register(user: UserRegister, conn = Depends(get_db)):
    """Register a new user"""
    cursor = conn.cursor(dictionary=True)
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
    if cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_pw = hash_password(user.password)
    user_id = user.user_id or f"USR{random.randint(1000, 9999)}"
    
    cursor.execute(
        "INSERT INTO users (user_id, email, password_hash) VALUES (%s, %s, %s)",
        (user_id, user.email, hashed_pw)
    )
    conn.commit()
    cursor.close()
    
    # Generate token
    token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login(user: UserLogin, conn = Depends(get_db)):
    """Login user"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    db_user = cursor.fetchone()
    cursor.close()
    
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/auth/request-otp")
def request_otp(request: OTPRequest, conn = Depends(get_db)):
    """Generate and send OTP"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email = %s", (request.email,))
    user = cursor.fetchone()
    cursor.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    otp = generate_otp()
    otp_storage[request.email] = {
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)
    }
    
    # In production, send OTP via email/SMS
    print(f"OTP for {request.email}: {otp}")
    
    return {"message": "OTP sent successfully", "otp": otp}  # Remove otp in production

@app.post("/api/auth/verify-otp", response_model=Token)
def verify_otp(request: OTPVerify):
    """Verify OTP and generate token"""
    stored_otp = otp_storage.get(request.email)
    
    if not stored_otp:
        raise HTTPException(status_code=400, detail="OTP not found or expired")
    
    if datetime.utcnow() > stored_otp["expires_at"]:
        del otp_storage[request.email]
        raise HTTPException(status_code=400, detail="OTP expired")
    
    if stored_otp["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    del otp_storage[request.email]
    
    token = create_access_token(
        data={"sub": request.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# ============================================
# PRODUCT ENDPOINTS
# ============================================

@app.post("/api/products")
def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Create a new product"""
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO products (sku, name, category_id, uom, warehouse_location_id, reorder_level)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (product.sku, product.name, product.category_id, product.uom, 
             product.warehouse_location_id, product.reorder_level)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "message": "Product created successfully"}
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code=400, detail="Product SKU already exists")
    finally:
        cursor.close()

@app.get("/api/products")
def list_products(skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """List all products"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products LIMIT %s OFFSET %s", (limit, skip))
    products = cursor.fetchall()
    cursor.close()
    return products

@app.get("/api/products/{product_id}")
def get_product(product_id: int, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Get product by ID"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    cursor.close()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/api/products/{product_id}")
def update_product(product_id: int, product: ProductCreate, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Update product"""
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE products SET sku=%s, name=%s, category_id=%s, uom=%s, 
           warehouse_location_id=%s, reorder_level=%s, updated_at=NOW() WHERE id=%s""",
        (product.sku, product.name, product.category_id, product.uom,
         product.warehouse_location_id, product.reorder_level, product_id)
    )
    conn.commit()
    cursor.close()
    return {"message": "Product updated successfully"}

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Delete product"""
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    conn.commit()
    cursor.close()
    return {"message": "Product deleted successfully"}

# ============================================
# WAREHOUSE ENDPOINTS
# ============================================

@app.post("/api/warehouses")
def create_warehouse(warehouse: WarehouseCreate, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Create a new warehouse"""
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO warehouses (name, code, address) VALUES (%s, %s, %s)",
        (warehouse.name, warehouse.code, warehouse.address)
    )
    conn.commit()
    warehouse_id = cursor.lastrowid
    cursor.close()
    return {"id": warehouse_id, "message": "Warehouse created successfully"}

@app.get("/api/warehouses")
def list_warehouses(current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """List all warehouses"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM warehouses")
    warehouses = cursor.fetchall()
    cursor.close()
    return warehouses

# ============================================
# RECEIPT ENDPOINTS
# ============================================

@app.post("/api/receipts")
def create_receipt(receipt: ReceiptCreate, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Create a new receipt"""
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO receipts (vendor_name, warehouse_id, ref_no, contact, remarks, status, created_by)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (receipt.vendor_name, receipt.warehouse_id, receipt.ref_no, receipt.contact,
         receipt.remarks, receipt.status, current_user["id"])
    )
    receipt_id = cursor.lastrowid
    
    for item in receipt.items:
        cursor.execute(
            "INSERT INTO receipt_items (receipt_id, product_id, quantity) VALUES (%s, %s, %s)",
            (receipt_id, item["product_id"], item["quantity"])
        )
    
    conn.commit()
    cursor.close()
    return {"id": receipt_id, "message": "Receipt created successfully"}

@app.get("/api/receipts")
def list_receipts(skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """List all receipts"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM receipts LIMIT %s OFFSET %s", (limit, skip))
    receipts = cursor.fetchall()
    cursor.close()
    return receipts

# ============================================
# DELIVERY ENDPOINTS
# ============================================

@app.post("/api/deliveries")
def create_delivery(delivery: DeliveryCreate, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Create a new delivery"""
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO deliveries (customer_name, warehouse_id, ref_no, remarks, status, created_by)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (delivery.customer_name, delivery.warehouse_id, delivery.ref_no,
         delivery.remarks, delivery.status, current_user["id"])
    )
    delivery_id = cursor.lastrowid
    
    for item in delivery.items:
        cursor.execute(
            "INSERT INTO delivery_items (delivery_id, product_id, quantity) VALUES (%s, %s, %s)",
            (delivery_id, item["product_id"], item["quantity"])
        )
    
    conn.commit()
    cursor.close()
    return {"id": delivery_id, "message": "Delivery created successfully"}

@app.get("/api/deliveries")
def list_deliveries(skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """List all deliveries"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM deliveries LIMIT %s OFFSET %s", (limit, skip))
    deliveries = cursor.fetchall()
    cursor.close()
    return deliveries

# ============================================
# TRANSFER ENDPOINTS
# ============================================

@app.post("/api/transfers")
def create_transfer(transfer: TransferCreate, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Create a new transfer"""
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO transfers (from_warehouse_id, to_warehouse_id, ref_no, remarks, status, created_by)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (transfer.from_warehouse_id, transfer.to_warehouse_id, transfer.ref_no,
         transfer.remarks, transfer.status, current_user["id"])
    )
    transfer_id = cursor.lastrowid
    
    for item in transfer.items:
        cursor.execute(
            "INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES (%s, %s, %s)",
            (transfer_id, item["product_id"], item["quantity"])
        )
    
    conn.commit()
    cursor.close()
    return {"id": transfer_id, "message": "Transfer created successfully"}

@app.get("/api/transfers")
def list_transfers(skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """List all transfers"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM transfers LIMIT %s OFFSET %s", (limit, skip))
    transfers = cursor.fetchall()
    cursor.close()
    return transfers

# ============================================
# ADJUSTMENT ENDPOINTS
# ============================================

@app.post("/api/adjustments")
def create_adjustment(adjustment: AdjustmentCreate, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Create a new adjustment"""
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO adjustments (warehouse_id, reason, status, created_by)
           VALUES (%s, %s, %s, %s)""",
        (adjustment.warehouse_id, adjustment.reason, adjustment.status, current_user["id"])
    )
    adjustment_id = cursor.lastrowid
    
    for item in adjustment.items:
        cursor.execute(
            "INSERT INTO adjustment_items (adjustment_id, product_id, counted_qty) VALUES (%s, %s, %s)",
            (adjustment_id, item["product_id"], item["counted_qty"])
        )
    
    conn.commit()
    cursor.close()
    return {"id": adjustment_id, "message": "Adjustment created successfully"}

@app.get("/api/adjustments")
def list_adjustments(skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """List all adjustments"""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM adjustments LIMIT %s OFFSET %s", (limit, skip))
    adjustments = cursor.fetchall()
    cursor.close()
    return adjustments

# ============================================
# STOCK ENDPOINTS
# ============================================

@app.get("/api/stock")
def get_stock(warehouse_id: Optional[int] = None, current_user: dict = Depends(get_current_user), conn = Depends(get_db)):
    """Get stock snapshot"""
    cursor = conn.cursor(dictionary=True)
    if warehouse_id:
        cursor.execute(
            """SELECT ss.*, p.name as product_name, p.sku, w.name as warehouse_name
               FROM stock_snapshot ss
               JOIN products p ON ss.product_id = p.id
               JOIN warehouses w ON ss.warehouse_id = w.id
               WHERE ss.warehouse_id = %s""",
            (warehouse_id,)
        )
    else:
        cursor.execute(
            """SELECT ss.*, p.name as product_name, p.sku, w.name as warehouse_name
               FROM stock_snapshot ss
               JOIN products p ON ss.product_id = p.id
               JOIN warehouses w ON ss.warehouse_id = w.id"""
        )
    stock = cursor.fetchall()
    cursor.close()
    return stock

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Warehouse Management System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)