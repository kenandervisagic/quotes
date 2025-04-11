from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow only specific origin (kdidp.art) for CORS
origins = [
    "https://kdidp.art",
]

# Add CORS middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests only from kdidp.art
    allow_credentials=True,
    allow_methods=["POST"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define a Pydantic model for the incoming JSON
class Message(BaseModel):
    content: str

# Get the Slack webhook URL from the environment variable
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

@app.post("/submit-message")
async def send_message(message: Message):
    if not SLACK_WEBHOOK_URL:
        return {"status": "Error", "message": "Slack webhook URL not set in environment"}

    # Add the emoji and the message content
    slack_payload = {
        "text": ":new: :tada: New submit: \n" + message.content
    }

    response = requests.post(SLACK_WEBHOOK_URL, json=slack_payload)

    if response.status_code == 200:
        return {"status": "Message sent to Slack successfully"}
    else:
        return {"status": "Failed to send message to Slack", "error": response.text}


