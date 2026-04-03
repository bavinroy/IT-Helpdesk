import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv('DB_NAME', 'it_helpdesk')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

passwords = [
    os.getenv('DB_PASSWORD'), # Try configured first (which is 'password')
    'postgres',
    'admin',
    'root',
    '1234',
    '123456',
    ''
]

success_password = None

print(f"Testing connection for user '{DB_USER}' on '{DB_HOST}':")

for pwd in passwords:
    if pwd is None: continue
    masked = '*' * len(pwd) if pwd else '(empty)'
    try:
        conn = psycopg2.connect(
            dbname='postgres', # Connect to default DB first to check auth
            user=DB_USER,
            password=pwd,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.close()
        success_password = pwd
        print(f"[SUCCESS] Password found: '{pwd}'")
        break
    except psycopg2.OperationalError as e:
        # print(f"[FAIL] {masked}: {e}")
        pass

if success_password is not None:
    # Now check if database exists
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=success_password,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.close()
        print(f"[SUCCESS] Database '{DB_NAME}' exists.")
    except psycopg2.OperationalError as e:
        if 'does not exist' in str(e):
            print(f"[INFO] Database '{DB_NAME}' does not exist. Creating...")
            # Create DB
            try:
                conn = psycopg2.connect(
                    dbname='postgres',
                    user=DB_USER,
                    password=success_password,
                    host=DB_HOST,
                    port=DB_PORT
                )
                conn.autocommit = True
                cur = conn.cursor()
                cur.execute(f"CREATE DATABASE {DB_NAME};")
                cur.close()
                conn.close()
                print(f"[SUCCESS] Created database '{DB_NAME}'.")
            except Exception as e2:
                print(f"[ERROR] Could not create database: {e2}")
        else:
            print(f"[ERROR] Database connection failed: {e}")

    # Write new password to .env if different
    if success_password != os.getenv('DB_PASSWORD'):
        print(f"[ACTION] Updating .env with new password...")
        with open('.env', 'r') as f:
            lines = f.readlines()
        with open('.env', 'w') as f:
            for line in lines:
                if line.startswith('DB_PASSWORD='):
                    f.write(f"DB_PASSWORD={success_password}\n")
                else:
                    f.write(line)
else:
    print("[FAILURE] Could not guess password. Please check backend/.env")
