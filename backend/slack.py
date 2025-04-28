import logging
import os
import random
import textwrap
import uuid
from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageFont
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from minio import Minio
from pydantic import BaseModel
from pymongo import DESCENDING

from mongo import save_submission, submissions_collection
from utils.validate_message import is_message_valid

app = FastAPI()
logger = logging.getLogger("uvicorn")
api_router = APIRouter()

# Environment variables
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK")
MINIO_URL = os.getenv("MINIO_URL", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "muki")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "kenomuki")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "images")
FONT_PATH = os.getenv("FONT_PATH", "ReenieBeanie-Regular.ttf")
ENVIRONMENT = os.getenv("ENVIRONMENT", "")

# Minio client
minio_client = Minio(
    MINIO_URL,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=(ENVIRONMENT != "local"),
)


class Message(BaseModel):
    content: str

    class Config:
        schema_extra = {
            "example": {
                "content": "This is a sample quote."
            }
        }

    @classmethod
    def validate_content(cls, v):
        return is_message_valid(v)


if ENVIRONMENT == "local":
    origins = ["*"]
else:
    origins = ["https://kdidp.art"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


def add_text_to_random_image(text: str) -> BytesIO:
    # color_folder = random.choice(["black", "white"]) no images in black folder
    color_folder = "white"
    image_dir = os.path.join("images", color_folder)
    image_files = [f for f in os.listdir(image_dir) if f.lower().endswith((".png", ".jpg", ".jpeg"))]

    if not image_files:
        raise FileNotFoundError(f"No images found in '{image_dir}'.")

    chosen_image_path = os.path.join(image_dir, random.choice(image_files))
    image = Image.open(chosen_image_path).convert("RGB")

    # Apply dark overlay to make text more readable
    overlay = Image.new("RGB", image.size, (0, 0, 0))
    image = Image.blend(image, overlay, alpha=0.3)

    draw = ImageDraw.Draw(image)

    try:
        font = ImageFont.truetype(FONT_PATH, size=65)
        watermark_font = ImageFont.truetype(FONT_PATH, size=30)  # smaller font for watermark
    except IOError:
        font = ImageFont.load_default()
        watermark_font = font

    # Wrap text
    max_width = image.width - 200
    lines = []
    for line in textwrap.wrap(text, width=20):
        while True:
            bbox = draw.textbbox((0, 0), line, font=font)
            if bbox[2] - bbox[0] <= max_width:
                break
            line = line[:-1]
        lines.append(line)

    # Centered vertical layout
    line_height = font.getbbox("A")[3] - font.getbbox("A")[1]
    total_height = line_height * len(lines)
    y_text = (image.height - total_height) // 2

    text_color = "white" if color_folder == "white" else "black"

    for line in lines:
        line_width = draw.textlength(line, font=font)
        x_text = (image.width - line_width) // 2
        draw.text((x_text, y_text), line, font=font, fill=text_color)
        y_text += line_height

    # Add watermark at bottom center
    watermark_text = "@the_words_left_behind"
    watermark_color = (0, 0, 0, 230) if color_folder == "black" else (255, 255, 255, 230)

    # Create transparent layer for watermark
    watermark_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    watermark_draw = ImageDraw.Draw(watermark_layer)

    watermark_width = watermark_draw.textlength(watermark_text, font=watermark_font)
    x_watermark = (image.width - watermark_width) // 2
    y_watermark = image.height - 100  # margin from bottom

    watermark_draw.text((x_watermark, y_watermark), watermark_text, font=watermark_font, fill=watermark_color)

    # Merge watermark layer
    image = image.convert("RGBA")
    image = Image.alpha_composite(image, watermark_layer)

    img_io = BytesIO()
    image.convert("RGB").save(img_io, 'PNG')  # save final image without alpha
    img_io.seek(0)
    return img_io


# Upload image to Minio
def upload_image_to_minio(image_io: BytesIO, filename: str) -> str:
    # Adjust the Minio URL based on the environment when returning the image URL
    if ENVIRONMENT == "local":
        minio_url = "localhost:9000"  # Local Minio URL
    else:
        minio_url = "minio.kdidp.art"  # Production Minio URL

    # Upload the image to Minio
    minio_client.put_object(
        MINIO_BUCKET_NAME,
        filename,
        image_io,
        len(image_io.getvalue()),
        content_type="image/png"
    )

    if ENVIRONMENT == "local":
        return f"http://{minio_url}/{MINIO_BUCKET_NAME}/{filename}"
    else:
        return f"https://{minio_url}/{MINIO_BUCKET_NAME}/{filename}"  # Return HTTPS URL in production


# Health check
@api_router.get("/health", response_class=JSONResponse)
async def health():
    return {"status": "ok"}


# Submit message and generate image
@api_router.post("/submit-message")
async def submit_post(message: Message):
    if not SLACK_WEBHOOK_URL:
        logger.error("Slack webhook URL is not set in the environment.")
        raise HTTPException(status_code=500, detail="Slack webhook URL not set in environment")

    # Validate content
    if Message.validate_content(message.content):
        slack_payload = {
            "text": ":new: :tada: New submit: \n" + message.content
        }

        try:
            # Send to Slack
            response = requests.post(SLACK_WEBHOOK_URL, json=slack_payload)
            if response.status_code != 200:
                logger.error(f"Failed to send message to Slack: {response.text}")
                return JSONResponse(content={"status": "Failed to send message to Slack", "error": response.text},
                                    status_code=500)

            # Generate and upload image
            unique_id = uuid.uuid4()
            filename = f"{unique_id}.png"
            img_io = add_text_to_random_image(message.content)
            image_url = upload_image_to_minio(img_io, filename)

            # Save submission to MongoDB
            submission_id = save_submission(image_url)
            return JSONResponse(
                content={"status": "success", "image_url": image_url, "submission_id": str(submission_id)})

        except requests.exceptions.RequestException as e:
            logger.error(f"Error while sending message to Slack: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to send message to Slack: {str(e)}")
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to generate image: {str(e)}")


# Assuming submissions_collection is your MongoDB collection
@api_router.get("/images")
async def get_images(
        limit: int = 10,
        sort: str = "date",
        start_after_id: str = None,
        start_after_likes: int = None
):
    try:
        # Validate sort parameter
        if sort not in ["date", "likes"]:
            raise HTTPException(status_code=400, detail="Invalid sort parameter. Must be 'date' or 'likes'.")

        # Define query and sort criteria
        query_filter = {}
        if sort == "date":
            sort_fields = [("_id", DESCENDING)]  # Newest first
            if start_after_id:
                query_filter = {"_id": {"$lt": ObjectId(start_after_id)}}
        elif sort == "likes":
            sort_fields = [("likes", DESCENDING), ("_id", DESCENDING)]  # Likes, then _id as tiebreaker
            if start_after_id and start_after_likes is not None:
                query_filter = {
                    "$or": [
                        {"likes": {"$lt": start_after_likes}},
                        {"likes": start_after_likes, "_id": {"$lt": ObjectId(start_after_id)}}
                    ]
                }

        # Log for debugging
        # Fetch from MongoDB
        cursor = submissions_collection.find(query_filter).sort(sort_fields).limit(limit)
        images_data = []
        last_id = None
        last_likes = None

        for doc in cursor:
            image_data = {
                "submission_id": str(doc["_id"]),
                "image_url": doc.get("image_url", ""),
                "timestamp": doc.get("timestamp").isoformat() if doc.get("timestamp") else "",
                "likes": doc.get("likes", 0)
            }
            images_data.append(image_data)
            last_id = str(doc["_id"])
            last_likes = doc.get("likes", 0) if sort == "likes" else None

        # Prepare response
        response = {"images": images_data}
        if len(images_data) == limit:  # More data exists
            response["next_start_after_id"] = last_id
            if sort == "likes":
                response["next_start_after_likes"] = last_likes

        return JSONResponse(content=response)

    except Exception as e:
        logger.error(f"Error fetching images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch images: {str(e)}")


# Endpoint to like or unlike a post
@api_router.post("/like")
async def like_post(submission_id: str, like_action: str):
    try:
        # Validate like_action
        if like_action not in ["increase", "decrease"]:
            raise HTTPException(status_code=400, detail="Invalid like action. Must be 'increase' or 'decrease'.")

        # Convert the submission_id to an ObjectId
        try:
            obj_id = ObjectId(submission_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid submission_id format.")

        # Query the database to find the submission
        submission = submissions_collection.find_one({"_id": obj_id})

        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found.")

        # Get current like count or default to 0 if not present
        current_likes = submission.get('likes', 0)

        # Modify the likes count
        if like_action == "increase":
            new_likes = current_likes + 1
        elif like_action == "decrease" and current_likes > 0:
            new_likes = current_likes - 1
        else:
            # Prevent likes from going below zero
            new_likes = current_likes

        # Update the likes count in the database
        submissions_collection.update_one(
            {"_id": obj_id},
            {"$set": {"likes": new_likes}}
        )

        # Return the updated like count
        return JSONResponse(content={"status": "success", "likes": new_likes})

    except Exception as e:
        logger.error(f"Error updating likes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update likes: {str(e)}")


app.include_router(api_router, prefix="/api/v1")
