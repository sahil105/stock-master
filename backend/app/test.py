import mysql.connector
from mysql.connector import Error

def connect():
    try:
        connection = mysql.connector.connect(
            host="0.tcp.in.ngrok.io",
            port=18785,
            user="team_maven",
            password="maven@123",
            database="StockMaster"
        )

        if connection.is_connected():
            print("Connected to MySQL successfully!")
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            record = cursor.fetchone()
            print("You're connected to database:", record)

    except Error as e:
        print("Error connecting:", e)

    finally:
        if 'connection' in locals() and connection.is_connected():
            connection.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    connect()