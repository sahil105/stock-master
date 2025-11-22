"""
Database connection test using environment variables.
This is a simple test to verify database connectivity.
For comprehensive testing, use test_services.py instead.
"""
from app.config import get_settings
from app.database import engine

def test_database_connection():
    """Test database connection using environment variables."""
    try:
        settings = get_settings()
        print(f"Attempting to connect to database...")
        print(f"Database: {settings.DB_NAME}")
        print(f"Host: {settings.DB_HOST}")
        print(f"Port: {settings.DB_PORT}")
        print(f"User: {settings.DB_USER}")
        
        connection = engine.connect()
        print("✓ Connected to MySQL successfully!")
        
        # Test query
        result = connection.execute("SELECT DATABASE();")
        record = result.fetchone()
        print(f"✓ You're connected to database: {record[0] if record else 'Unknown'}")
        
        connection.close()
        print("✓ MySQL connection closed.")
        return True
        
    except Exception as e:
        print(f"✗ Error connecting: {e}")
        print("\nPlease check:")
        print("1. Database server is running")
        print("2. .env file is configured correctly")
        print("3. Database credentials are correct")
        print("4. Database exists and user has permissions")
        return False

if __name__ == "__main__":
    test_database_connection()