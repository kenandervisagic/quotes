from fastapi import FastAPI, APIRouter
from pydantic import BaseModel
import requests
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Create a router for versioning
api_router = APIRouter()

ENVIRONMENT = os.getenv("ENVIRONMENT", "local")

# Allow only specific origin (kdidp.art) for CORS
if ENVIRONMENT == "local":
    origins = [
        "*",  # Allow all origins in local environment
    ]
else:
    origins = [
        "https://kdidp.art",  # Only allow requests from the production domain
    ]

# Add CORS middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests only from kdidp.art
    allow_credentials=True,
    allow_methods=["POST"],  # Allow POST method
    allow_headers=["*"],  # Allow all headers
)

# Define a Pydantic model for the incoming JSON
class Message(BaseModel):
    content: str

# Get the Slack webhook URL from the environment variable
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK")

@api_router.post("/submit-message")
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

# Include the API router with the prefix
app.include_router(api_router, prefix="/api/v1")