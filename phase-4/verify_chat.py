import requests
import json

def test_chat_functionality():
    print("Testing chat functionality...")

    # Login to get token
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }

    response = requests.post("http://localhost:8002/api/v1/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return False

    token_data = response.json()
    token = token_data['access_token']
    print(f"[SUCCESS] Login successful! Token: {token[:20]}...")

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

    response = requests.post("http://localhost:8002/api/chat", headers=headers, json=chat_data, stream=True)
    print(f"Chat API Status: {response.status_code}")

    if response.status_code == 200:
        # Read the streaming response
        response_text = ""
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                response_text += decoded_line + "\n"
                if '[DONE]' in decoded_line:
                    break

        print("[SUCCESS] Chat API is working!")
        print("Response preview:")
        print(response_text[:500] + "..." if len(response_text) > 500 else response_text)
        return True
    else:
        print(f"[ERROR] Chat API failed: {response.text}")
        return False

if __name__ == "__main__":
    success = test_chat_functionality()
    if success:
        print("\n[ALL GOOD] All tests passed! Chat functionality is working correctly.")
    else:
        print("\n[FAILED] Tests failed!")