import requests
import json

# Login to get token
login_data = {
    "email": "test@example.com",
    "password": "testpassword123"
}

response = requests.post("http://127.0.0.1:8000/api/v1/auth/login", json=login_data)
if response.status_code == 200:
    token_data = response.json()
    token = token_data['access_token']
    print(f"Login successful, token: {token[:20]}...")

    # Test chat API
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    chat_data = {
        "messages": [
            {"role": "user", "content": "Hello, can you help me create a task?"}
        ]
    }

    chat_response = requests.post("http://127.0.0.1:8000/api/chat", headers=headers, json=chat_data)
    print(f"Chat API Response Status: {chat_response.status_code}")
    print(f"Chat API Response: {chat_response.text}")
else:
    print(f"Login failed: {response.status_code} - {response.text}")