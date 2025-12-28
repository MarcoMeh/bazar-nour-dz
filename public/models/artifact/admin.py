import bcrypt
from db import db

password = "aliance"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()

db.execute(
    "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)",
    ("admin", hashed, "admin05")
)

print("✓ Admin user created")
