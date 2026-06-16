import pytest
from jose import JWTError
from services.auth_service import hash_password, verify_password, create_access_token, decode_token

# Password Hashing Tests
def test_hash_password_generates_different_string():
    password = "MahmoudSecurePass#123"
    hashed = hash_password(password)
    
    assert hashed != password
    assert len(hashed) > 20  # Bcrypt hashes are long

def test_verify_password_correctly_validates():
    password = "MahmoudSecurePass#123"
    hashed = hash_password(password)
    
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

# JWT Token Tests
def test_create_and_decode_access_token():
    user_id = 99
    email = "testuser@fitnex.com"
    
    # Create token
    token = create_access_token(user_id=user_id, email=email)
    assert isinstance(token, str)
    assert len(token) > 50
    
    # Decode token
    decoded_payload = decode_token(token)
    assert decoded_payload["sub"] == str(user_id)
    assert decoded_payload["email"] == email
    assert "exp" in decoded_payload
    assert "iat" in decoded_payload

def test_decode_token_fails_on_invalid_string():
    invalid_token = "this.is.not.a.real.jwt.token"
    
    with pytest.raises(JWTError):
        decode_token(invalid_token)
