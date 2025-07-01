import os
from pymongo import MongoClient
import random

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
submissions_collection = db.submissions  # Access the 'submissions' collection

anonymous_alternatives = [
    "someone_like_you",
    "quiet_soul",
    "passing_thought",
    "unknown_voice",
    "from_the_void",
    "left_unsaid",
    "hidden_whisper",
    "fleeting_echo",
    "silent_presence",
    "unseen_heart",
    "secret_mind",
    "wandering_voice",
    "unspoken_truth",
    "echo_in_the_dark",
    "shadowed_words",
    "forgotten_whisper",
    "veiled_thought",
    "unknown_presence",
    "quiet_whisperer",
    "unheard_soul",
    "hidden_whisperer",
    "unnoticed_thought",
    "lost_voice",
    "shadowy_mind",
    "soft_echo",
    "unseen_whisper",
    "hidden_echo",
    "passing_whisper",
    "silent_thought",
    "veiled_echo",
    "unknown_murmur",
    "secret_echo",
    "wandering_mind",
    "quiet_murmur",
    "echo_of_silence",
    "unnoticed_echo",
    "shadow_whisper",
    "unvoiced_message",
    "subtle_presence",
    "secret_whisperer",
    "silent_whisper",
    "unseen_echo",
    "unknown_whisperer",
    "quiet_signal",
    "ghostly_message",
    "elusive_voice",
    "shadowed_echo",
    "unseen_murmur",
    "whispered_thought",
    "quiet_echo"
]

# Fetch all submissions from MongoDB
submissions = submissions_collection.find()

# Iterate through each submission and add a random username
for submission in submissions:
    random_username = random.choice(anonymous_alternatives)

    # Update the submission with the random username
    submissions_collection.update_one(
        {"_id": submission["_id"]},  # Find the document by its ID
        {"$set": {"username": random_username}}  # Add/Update the 'username' field
    )

    print(f"Updated submission with username: {random_username}")

print("Username updates completed for all submissions.")
