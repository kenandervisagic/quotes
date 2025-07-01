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


def delete_submission(submission_id: str):
    """Delete a submission from MongoDB by its ID."""
    result = submissions_collection.delete_one({"_id": submission_id})

    # Check if the deletion was successful
    if result.deleted_count > 0:
        return {"message": "Submission deleted successfully."}
    else:
        return {"message": "Submission not found or already deleted."}