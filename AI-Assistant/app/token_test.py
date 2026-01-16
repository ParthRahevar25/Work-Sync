from jose import jwt

SECRET_KEY = "worksync-secret"
ALGORITHM = "HS256"

payload = {
    "user_id": "123",
    "role": "Employee"
}

token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print(token)
