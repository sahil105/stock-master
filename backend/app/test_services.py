"""
Comprehensive test suite for all backend services.
Tests OTP generation, email service, database connection, and API endpoints.
"""
import os
import sys
import requests
import time
from typing import Optional

# Add the parent directory to the path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
from app.database import engine, get_db
from app.email_service import send_otp_email
from app.otp_generator import generate_numeric_otp
from app.models import OTP
from sqlalchemy.orm import Session
from sqlalchemy import text


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


def print_test_header(test_name: str):
    """Print a formatted test header."""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Testing: {test_name}{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")


def print_success(message: str):
    """Print a success message."""
    print(f"{Colors.GREEN}✓ {message}{Colors.RESET}")


def print_error(message: str):
    """Print an error message."""
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")


def print_warning(message: str):
    """Print a warning message."""
    print(f"{Colors.YELLOW}⚠ {message}{Colors.RESET}")


def test_configuration():
    """Test that all required environment variables are set."""
    print_test_header("Configuration Test")
    
    try:
        settings = get_settings()
        print_success("Settings loaded successfully")
        
        # Check email configuration
        if settings.EMAIL_ADDRESS and settings.EMAIL_ADDRESS != "your-email@gmail.com":
            print_success(f"Email address configured: {settings.EMAIL_ADDRESS}")
        else:
            print_warning("Email address not configured (using placeholder)")
        
        if settings.EMAIL_PASSWORD and settings.EMAIL_PASSWORD != "your-app-password-here":
            print_success("Email password configured")
        else:
            print_warning("Email password not configured (using placeholder)")
        
        # Check database configuration
        try:
            db_url = settings.resolved_database_url
            print_success(f"Database URL resolved: {db_url.split('@')[1] if '@' in db_url else 'configured'}")
        except ValueError as e:
            print_error(f"Database configuration incomplete: {e}")
            return False
        
        print_success(f"OTP length: {settings.OTP_LENGTH}")
        print_success(f"OTP expiry: {settings.OTP_EXPIRY_MINUTES} minutes")
        
        return True
    except Exception as e:
        print_error(f"Failed to load configuration: {e}")
        return False


def test_database_connection():
    """Test database connection."""
    print_test_header("Database Connection Test")
    
    try:
        settings = get_settings()
        db_url = settings.resolved_database_url
        
        # Test connection
        connection = engine.connect()
        print_success("Database connection established")
        
        # Test query
        result = connection.execute(text("Show tables"))
        result.fetchall()
        print_success("Database query executed successfully")
        
        connection.close()
        return True
    except Exception as e:
        print_error(f"Database connection failed: {e}")
        return False


def test_database_tables():
    """Test that database tables exist."""
    print_test_header("Database Tables Test")
    
    try:
        from app.database import Base
        Base.metadata.create_all(bind=engine)
        print_success("Database tables created/verified")
        
        # Test OTP table
        db: Session = next(get_db())
        try:
            count = db.query(OTP).count()
            print_success(f"OTP table accessible (current records: {count})")
            return True
        finally:
            db.close()
    except Exception as e:
        print_error(f"Database tables test failed: {e}")
        return False


def test_otp_generator():
    """Test OTP generation."""
    print_test_header("OTP Generator Test")
    
    try:
        settings = get_settings()
        
        # Generate multiple OTPs
        otps = [generate_numeric_otp(settings.OTP_LENGTH) for _ in range(5)]
        
        # Check format
        for otp in otps:
            if len(otp) != settings.OTP_LENGTH:
                print_error(f"OTP length incorrect: {otp} (expected {settings.OTP_LENGTH})")
                return False
            if not otp.isdigit():
                print_error(f"OTP contains non-numeric characters: {otp}")
                return False
        
        print_success(f"Generated {len(otps)} OTPs successfully")
        print_success(f"Sample OTPs: {', '.join(otps[:3])}")
        
        # Check uniqueness
        if len(set(otps)) == len(otps):
            print_success("All generated OTPs are unique")
        else:
            print_warning("Some OTPs are duplicates (this is possible but unlikely)")
        
        return True
    except Exception as e:
        print_error(f"OTP generation failed: {e}")
        return False


def test_email_service(test_email: Optional[str] = None):
    """Test email service (requires valid email configuration)."""
    print_test_header("Email Service Test")
    
    try:
        settings = get_settings()
        
        if not test_email:
            test_email = input("Enter a test email address to send OTP to (or press Enter to skip): ").strip()
            if not test_email:
                print_warning("Email test skipped (no email provided)")
                return None
        
        if settings.EMAIL_ADDRESS == "your-email@gmail.com" or settings.EMAIL_PASSWORD == "your-app-password-here":
            print_warning("Email credentials not configured. Skipping email test.")
            print_warning("To test email, update EMAIL_ADDRESS and EMAIL_PASSWORD in .env")
            return None
        
        test_otp = generate_numeric_otp(settings.OTP_LENGTH)
        send_otp_email(test_email, test_otp, settings.OTP_EXPIRY_MINUTES)
        print_success(f"OTP email sent to {test_email}")
        print_success(f"OTP code: {test_otp} (check your email)")
        return True
    except Exception as e:
        print_error(f"Email service test failed: {e}")
        print_warning("Make sure you have:")
        print_warning("  1. Valid Gmail credentials")
        print_warning("  2. App Password enabled (not regular password)")
        print_warning("  3. Less secure app access or 2FA with app password")
        return False


def test_api_endpoints(base_url: str = "http://localhost:8000"):
    """Test API endpoints (requires running server)."""
    print_test_header("API Endpoints Test")
    
    test_email = f"test_{int(time.time())}@example.com"
    
    # Test 1: Send OTP
    print("\n1. Testing POST /send-otp")
    try:
        response = requests.post(
            f"{base_url}/send-otp",
            json={"email": test_email},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Send OTP endpoint working: {data.get('message')}")
        else:
            print_error(f"Send OTP failed: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to API. Is the server running?")
        print_warning(f"Start the server with: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        return False
    except Exception as e:
        print_error(f"Send OTP test failed: {e}")
        return False
    
    # Test 2: Verify OTP (this will fail with invalid OTP, which is expected)
    print("\n2. Testing POST /verify-otp with invalid OTP")
    try:
        response = requests.post(
            f"{base_url}/verify-otp",
            json={"email": test_email, "otp": "000000"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if not data.get('success'):
                print_success(f"Verify OTP correctly rejected invalid OTP: {data.get('message')}")
            else:
                print_warning("Verify OTP accepted invalid OTP (unexpected)")
        else:
            print_error(f"Verify OTP failed: {response.status_code} - {response.text}")
    except Exception as e:
        print_error(f"Verify OTP test failed: {e}")
    
    # Test 3: Health check (if available)
    print("\n3. Testing API documentation endpoint")
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print_success("API documentation available at /docs")
        else:
            print_warning("API documentation not accessible")
    except Exception as e:
        print_warning(f"Could not access API docs: {e}")
    
    return True


def run_all_tests():
    """Run all tests."""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Backend Services Test Suite{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")
    
    results = {}
    
    # Configuration test
    results['configuration'] = test_configuration()
    
    if not results['configuration']:
        print_error("\nConfiguration test failed. Please check your .env file.")
        return results
    
    # Database tests
    results['database_connection'] = test_database_connection()
    results['database_tables'] = test_database_tables()
    
    # OTP generator test
    results['otp_generator'] = test_otp_generator()
    
    # Email service test (optional)
    email_result = test_email_service()
    if email_result is not None:
        results['email_service'] = email_result
    
    # API endpoints test (optional, requires running server)
    print(f"\n{Colors.YELLOW}Note: API endpoint tests require the server to be running.{Colors.RESET}")
    test_api = input("\nTest API endpoints? (y/n): ").strip().lower()
    if test_api == 'y':
        base_url = input("Enter API base URL (default: http://localhost:8000): ").strip()
        if not base_url:
            base_url = "http://localhost:8000"
        results['api_endpoints'] = test_api_endpoints(base_url)
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Test Summary{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}")
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}: PASSED")
        elif result is False:
            print_error(f"{test_name}: FAILED")
        else:
            print_warning(f"{test_name}: SKIPPED")
    
    passed = sum(1 for r in results.values() if r is True)
    total = sum(1 for r in results.values() if r is not None)
    
    print(f"\n{Colors.BLUE}Results: {passed}/{total} tests passed{Colors.RESET}")
    
    return results


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()

