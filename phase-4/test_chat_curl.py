import subprocess
import json

# Test the chat API using curl
def test_chat_with_curl():
    # Prepare the curl command
    curl_cmd = [
        'curl',
        '-X', 'POST',
        'http://localhost:8002/api/chat',
        '-H', 'Content-Type: application/json',
        '-H', 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NWQ4NjVlYS1kZTNiLTQ2YmYtOGM3Ni03NDhiNTUxZWM5ZGQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjE3Njk4MDU0MjZ9.GnnS2__tevSh3kANQl_JdWJ0b5Q77U9dM8_azcUp9BM',
        '-d', json.dumps({"messages": [{"role": "user", "content": "Hello, can you help me create a task?"}]}),
        '--no-buffer'
    ]

    print("Testing chatbot with curl...")
    print("Command:", " ".join(curl_cmd))
    print("=" * 50)

    try:
        # Execute the curl command
        result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)

        print(f"Return code: {result.returncode}")
        print(f"Stdout:\n{result.stdout}")
        if result.stderr:
            print(f"Stderr:\n{result.stderr}")

        return result.returncode == 0

    except subprocess.TimeoutExpired:
        print("Curl command timed out")
        return False
    except Exception as e:
        print(f"Error running curl: {e}")
        return False

if __name__ == "__main__":
    test_chat_with_curl()