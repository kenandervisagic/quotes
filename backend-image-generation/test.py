import os
from pymongo import MongoClient
from minio import Minio
from PIL import Image
import requests
from io import BytesIO
from bson.objectid import ObjectId

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:kenomuki@mongo:27017/images?authSource=admin")
client = MongoClient(MONGO_URI)
db = client["images"]
collection = db["submissions"]

# MinIO setup
MINIO_URL = os.getenv("MINIO_URL", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "muki")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "kenomuki")
MINIO_BUCKET = "thumbnails"
ENVIRONMENT = os.getenv("ENVIRONMENT", "")
MINIO_PUBLIC_URL = "localhost:9000" if ENVIRONMENT == "local" else "minio.kdidp.art"

minio_client = Minio(
    MINIO_URL,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=(ENVIRONMENT != "local"),
)


# Ensure thumbnails bucket exists
if not minio_client.bucket_exists(MINIO_BUCKET):
    minio_client.make_bucket(MINIO_BUCKET)

# Resize and upload
def resize_image_to_thumbnail(url):
    if ENVIRONMENT == "local":
        url = url.replace("localhost:9000", "minio:9000")
    print(f"Fetching image from: {url}")
    response = requests.get(url)
    image = Image.open(BytesIO(response.content)).convert("RGB")
    image = image.resize((552, 552))
    output = BytesIO()
    image.save(output, format="JPEG", quality=100)
    output.seek(0)
    return output

# Save the updated submission with thumbnail URL in MongoDB
def update_submission(submission_id, image_url, thumb_url):
    submission_data = {
        "image_url": image_url,
        "thumbnail_url": thumb_url,
    }
    # Convert submission_id to ObjectId
    result = collection.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": submission_data}
    )
    print(f"Updated document {submission_id}: matched={result.matched_count}, modified={result.modified_count}")

# Process all documents and generate/update thumbnails
def generate_thumbnails():
    results = []
    for doc in collection.find():  # Process all documents
        try:
            image_url = doc["image_url"]
            submission_id = str(doc["_id"])
            thumb_io = resize_image_to_thumbnail(image_url)

            # Save the thumbnail to Minio
            filename = f"{submission_id}.jpg"
            minio_client.put_object(
                MINIO_BUCKET,
                filename,
                thumb_io,
                length=thumb_io.getbuffer().nbytes,
                content_type="image/jpeg"
            )

            thumb_url = f"http{'s' if ENVIRONMENT != 'local' else ''}://{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/{filename}"

            # Save submission (with full-size and thumbnail URLs)
            update_submission(submission_id, image_url, thumb_url)

            results.append({"_id": submission_id, "status": "ok", "thumbnail_url": thumb_url})
        except Exception as e:
            results.append({"_id": str(doc["_id"]), "status": "error", "error": str(e)})

    return results

# Run the thumbnail generation function and return the results
if __name__ == "__main__":
    results = generate_thumbnails()
    for result in results:
        print(result)