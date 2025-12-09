
import urllib.request
import json

API_KEY = "AIzaSyBhjNtuz0GkGN7Ssr5fFnmjDDtd3pls7KY"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [{"text": "Explain how AI works"}]
    }]
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(URL, data=data, headers={'Content-Type': 'application/json'})

try:
    print(f"Testing URL: {URL}")
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        print("Response:")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
