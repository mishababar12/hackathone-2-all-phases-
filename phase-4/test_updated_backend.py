import requests
import json

def test_updated_backend():
    # Get fresh token
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }

    response = requests.post("http://localhost:8002/api/v1/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return

    token_data = response.json()
    token = token_data['access_token']
    print(f"✅ Got token: {token[:20]}...")

    # Test chat with streaming
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    chat_data = {
        "messages": [
            {"role": "user", "content": "Show me my tasks"}
        ]
    }

    print("Sending chat request...")
    response = requests.post(
        "http://localhost:8002/api/chat/",
        headers=headers,
        json=chat_data,
        stream=True
    )

    print(f"Response status: {response.status_code}")

    if response.status_code == 200:
        print("Chat response:")
        response_text = ""
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                response_text += decoded_line + "\n"
                print(f"  {decoded_line}")

                # Stop after getting the first data line to avoid hanging
                if '"content"' in decoded_line or '[DONE]' in decoded_line:
                    break
        return response_text
    else:
        print(f"Chat failed: {response.text}")
        return None

if __name__ == "__main__":
    test_updated_backend()