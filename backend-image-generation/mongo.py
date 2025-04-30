# mongodb.py
import os
from pymongo import MongoClient
from datetime import datetime

# Environment variables
MONGO_HOST = os.getenv("MONGO_HOST", "mongo")
MONGO_PORT = os.getenv("MONGO_PORT", "27017")
MONGO_DB = os.getenv("MONGO_DB", "images")
MONGO_USER = os.getenv("MONGO_USER", "mongo")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "kenomuki")

# MongoDB connection URI
MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}?authSource=admin"

# Initialize MongoDB client
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
submissions_collection = db.submissions  # Create a collection named 'submissions'

def save_submission( image_url: str):
    """Save the submission details into MongoDB."""
    timestamp = datetime.utcnow()  # Current timestamp in UTC
    submission_data = {
        "image_url": image_url,
        "timestamp": timestamp,
        "likes": 0
    }

    # Insert the submission data into MongoDB
    result = submissions_collection.insert_one(submission_data)
    return result.inserted_id
