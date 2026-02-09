import requests
import json

# Login to get token
login_data = {
    "email": "test@example.com",
    "password": "testpassword123"
}

response = requests.post("http://127.0.0.1:8002/api/v1/auth/login", json=login_data)
if response.status_code == 200:
    token_data = response.json()
    token = token_data['access_token']
    print(f"Login successful, token: {token[:20]}...")

    # Test chat API with a simple hello message
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    chat_data = {
        "messages": [
            {"role": "user", "content": "Hello"}
        ]
    }

    chat_response = requests.post("http://127.0.0.1:8002/api/chat", headers=headers, json=chat_data)
    print(f"Chat API Response Status: {chat_response.status_code}")
    print(f"Chat API Response Preview: {chat_response.text[:200]}...")

    if chat_response.status_code == 200:
        print("✅ Chat API is working correctly!")
    else:
        print("❌ Chat API is not working properly.")
else:
    print(f"❌ Login failed: {response.status_code} - {response.text}")