# backend/db.py
import os
import sqlite3
import urllib.parse
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartcrop.db")

def get_db_connection():
    """
    Establishes a connection to the database. Supports SQLite and PostgreSQL.
    """
    if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
        import psycopg2
        # Clean url if needed (e.g. postgresql vs postgres)
        url = DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        
        # Parse connection parameters
        conn = psycopg2.connect(url)
        return conn
    else:
        # Local SQLite
        # Extract path
        db_path = DATABASE_URL.replace("sqlite:///", "", 1)
        conn = sqlite3.connect(db_path)
        # Return dict-like rows for SQLite compatibility with psycopg2 dict cursor
        conn.row_factory = sqlite3.Row
        return conn

def init_db():
    """
    Creates tables if they do not exist by executing schema.sql.
    Also seeds default administrator account.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    schema_path = os.path.join(current_dir, "..", "db", "schema.sql")
    
    # Check if we are running on SQLite or Postgres
    is_sqlite = not (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"))
    
    if os.path.exists(schema_path):
        with open(schema_path, "r") as f:
            schema_sql = f.read()
        
        if is_sqlite:
            # SQLite doesn't support SERIAL or ON CONFLICT (key) DO NOTHING in the same syntax,
            # so let's adjust the SQL statements for SQLite compatibility.
            schema_sql = schema_sql.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
            schema_sql = schema_sql.replace("REAL NOT NULL", "DOUBLE PRECISION NOT NULL")
            schema_sql = schema_sql.replace("REAL", "DOUBLE PRECISION")
            schema_sql = schema_sql.replace("TIMESTAMP DEFAULT CURRENT_TIMESTAMP", "DATETIME DEFAULT CURRENT_TIMESTAMP")
            # Replace foreign keys syntax if necessary, SQLite supports REFERENCES
            # Split by statements
            statements = schema_sql.split(";")
            for stmt in statements:
                if stmt.strip():
                    try:
                        cursor.execute(stmt)
                    except Exception as e:
                        print(f"Error executing SQLite schema statement: {e}")
        else:
            # Postgres
            try:
                cursor.execute(schema_sql)
            except Exception as e:
                conn.rollback()
                print(f"Error executing Postgres schema DDL: {e}")
                raise e
        conn.commit()
    else:
        print("schema.sql not found, skipping table creation.")

    # Seed Admin User
    admin_email = os.getenv("ADMIN_EMAIL", "admin@smartcrop.ai")
    admin_password = os.getenv("ADMIN_PASSWORD", "AdminSmartCrop2026!")
    
    # Hash password
    from backend.auth_utils import hash_password
    pwd_hash = hash_password(admin_password)
    
    try:
        # Check if admin exists
        if is_sqlite:
            cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
            exists = cursor.fetchone()
            if not exists:
                cursor.execute(
                    "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
                    (admin_email, pwd_hash, "System Administrator", "admin")
                )
                conn.commit()
                print(f"Seeded admin user: {admin_email}")
        else:
            cursor.execute("SELECT id FROM users WHERE email = %s", (admin_email,))
            exists = cursor.fetchone()
            if not exists:
                cursor.execute(
                    "INSERT INTO users (email, password_hash, name, role) VALUES (%s, %s, %s, %s)",
                    (admin_email, pwd_hash, "System Administrator", "admin")
                )
                conn.commit()
                print(f"Seeded admin user: {admin_email}")
    except Exception as e:
        conn.rollback()
        print(f"Error seeding admin user: {e}")
    finally:
        conn.close()

# Helper queries
def query_db(query, args=(), one=False):
    conn = get_db_connection()
    is_sqlite = not (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"))
    
    # For postgres, use RealDictCursor to match sqlite's Row interface
    cursor = None
    if not is_sqlite:
        import psycopg2.extras
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Convert ? to %s in query for Postgres
        query = query.replace("?", "%s")
    else:
        cursor = conn.cursor()
        
    try:
        cursor.execute(query, args)
        rv = cursor.fetchall()
        # Convert to dict representation
        if rv:
            if is_sqlite:
                results = [dict(row) for row in rv]
            else:
                results = [dict(row) for row in rv]
        else:
            results = []
        return (results[0] if results else None) if one else results
    except Exception as e:
        print(f"Database query error: {e}")
        return None
    finally:
        conn.close()

def execute_db(query, args=()):
    conn = get_db_connection()
    is_sqlite = not (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"))
    
    cursor = conn.cursor()
    if not is_sqlite:
        query = query.replace("?", "%s")
        
    try:
        cursor.execute(query, args)
        conn.commit()
        # Get last inserted id if relevant
        if is_sqlite:
            last_id = cursor.lastrowid
        else:
            try:
                # If RETURNING was used or we can fetch, otherwise return None
                last_id = cursor.fetchone()[0]
            except Exception:
                last_id = None
        return last_id
    except Exception as e:
        conn.rollback()
        print(f"Database execute error: {e}")
        raise e
    finally:
        conn.close()
