import requests
import json

# Test the authentication and chat functionality
BASE_URL = "http://localhost:8002"

def test_login():
    """Test login with the existing test user."""
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }

    response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    print(f"Login status: {response.status_code}")

    if response.status_code == 200:
        token_data = response.json()
        token = token_data['access_token']
        print(f"[SUCCESS] Login successful! Token: {token[:20]}...")
        return token
    else:
        print(f"[ERROR] Login failed: {response.text}")
        return None

def test_chat_api(token):
    """Test the chat API with the obtained token."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    chat_data = {
        "messages": [
            {"role": "user", "content": "Hello, can you help me create a task?"}
        ]
    }

    response = requests.post(f"{BASE_URL}/api/chat", headers=headers, json=chat_data, stream=True)
    print(f"Chat API status: {response.status_code}")

    if response.status_code == 200:
        print("[SUCCESS] Chat API connected successfully!")
        print("Response (first few lines):")
        lines_received = 0
        for line in response.iter_lines():
            if line and lines_received < 5:  # Show first few lines
                print(f"  {line.decode('utf-8')}")
                lines_received += 1
            elif lines_received >= 5:
                break
        return True
    else:
        print(f"[ERROR] Chat API failed: {response.text}")
        return False

if __name__ == "__main__":
    print("Testing authentication and chat functionality...")
    print("=" * 50)

    # Test login
    token = test_login()
    if not token:
        exit(1)

    print()

    # Test chat
    test_chat_api(token)

    print()
    print("=" * 50)
    print("Tests completed!")