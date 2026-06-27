# backend/auth_utils.py
import hashlib
import os
from datetime import datetime, timedelta
from typing import Union, Any
from jose import jwt

# Secret configurations
JWT_SECRET = os.getenv("JWT_SECRET", "local-dev-jwt-secret-key-smartcrop-2026-agritech")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

def hash_password(password: str) -> str:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
    except Exception:
        # Fallback SHA256 with simple salt
        salt = "smartcrop-2026-salt"
        return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        salt = "smartcrop-2026-salt"
        return hashlib.sha256((plain_password + salt).encode('utf-8')).hexdigest() == hashed_password

def create_access_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_at = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expires_at = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expires_at, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Union[str, None]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except Exception:
        return None
