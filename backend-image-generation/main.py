import logging
import os
import random
import uuid
from io import BytesIO
import time
import requests
from PIL import Image, ImageDraw, ImageFont
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from minio import Minio
from pydantic import BaseModel

from mongo import save_submission
from utils.validate_message import is_message_valid
from utils.wrap_text import adjust_text_for_image

app = FastAPI(
    docs_url=None,
    redoc_url=None,
    openapi_url=None
)

logger = logging.getLogger("uvicorn")
api_router = APIRouter()

# Environment variables
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK")
MINIO_URL = os.getenv("MINIO_URL", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "muki")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "kenomuki")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "thumbnails")
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
    origins = ["https://thewordsleftbehind.com", "https://www.thewordsleftbehind.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

def add_text_to_image_and_save_as_webp(text: str) -> BytesIO:
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

    lines = adjust_text_for_image(text, max_width=20, font=font, draw=draw)

    # Centered vertical layout
    line_height = font.getbbox("A")[3] - font.getbbox("A")[1]
    line_spacing = int(line_height * 1.2)  # adjust multiplier as needed

    total_height = line_spacing * len(lines)

    y_text = (image.height - total_height) // 2

    text_color = "white" if color_folder == "white" else "black"

    for line in lines:
        line_width = draw.textlength(line, font=font)
        x_text = (image.width - line_width) // 2
        draw.text((x_text, y_text), line, font=font, fill=text_color)
        y_text += line_spacing

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

    # Save the image directly as WebP
    img_io = BytesIO()
    image.save(img_io, format="WEBP", quality=100, method=6, lossless=False)
    img_io.seek(0)
    return img_io


def upload_image_to_minio(image_io: BytesIO, filename: str, bucket_name: str, content_type: str) -> str:
    # Adjust the Minio URL based on the environment when returning the image URL
    if ENVIRONMENT == "local":
        minio_url = "localhost:9000"  # Local Minio URL
    else:
        minio_url = "minio.thewordsleftbehind.com"  # Production Minio URL

    # Upload the image to Minio
    minio_client.put_object(
        bucket_name,
        filename,
        image_io,
        len(image_io.getvalue()),
        content_type
    )

    if ENVIRONMENT == "local":
        return f"http://{minio_url}/{bucket_name}/{filename}"
    else:
        return f"https://{minio_url}/{bucket_name}/{filename}"  # Return HTTPS URL in production


# Health check
@api_router.get("/health", response_class=JSONResponse)
async def health():
    return {"status": "ok"}


# Submit message and generate image
import time  # Add this at the top if not already imported

@api_router.post("/submit-message")
async def submit_post(message: Message):
    start_total = time.time()

    if not SLACK_WEBHOOK_URL:
        logger.error("Slack webhook URL is not set in the environment.")
        raise HTTPException(status_code=500, detail="Slack webhook URL not set in environment")

    # Validation
    validate_start = time.time()
    if not Message.validate_content(message.content):
        logger.warning("Invalid message submitted")
        raise HTTPException(status_code=400, detail="Invalid message")
    validate_end = time.time()
    logger.info(f"[TIMING] Message validation: {validate_end - validate_start:.3f}s")

    # Slack notification (only if not local)
    slack_start = time.time()
    if ENVIRONMENT != "local":
        slack_payload = {
            "text": ":new: :tada: New submit: \n" + message.content
        }
        try:
            response = requests.post(SLACK_WEBHOOK_URL, json=slack_payload)
            if response.status_code != 200:
                logger.error(f"Failed to send message to Slack: {response.text}")
                return JSONResponse(content={"status": "Failed to send message to Slack", "error": response.text},
                                    status_code=500)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error while sending message to Slack: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to send message to Slack: {str(e)}")
    slack_end = time.time()
    logger.info(f"[TIMING] Slack webhook: {slack_end - slack_start:.3f}s")

    # Image generation
    gen_start = time.time()
    try:
        unique_id = uuid.uuid4()
        filename = f"{unique_id}.webp"
        img_io = add_text_to_image_and_save_as_webp(message.content)
    except Exception as e:
        logger.error(f"Image generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Image generation failed")
    gen_end = time.time()
    logger.info(f"[TIMING] Image generation: {gen_end - gen_start:.3f}s")

    # Upload to MinIO
    upload_start = time.time()
    try:
        full_size_url = upload_image_to_minio(img_io, filename, MINIO_BUCKET_NAME, content_type="image/webp")
    except Exception as e:
        logger.error(f"MinIO upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Image upload failed")
    upload_end = time.time()
    logger.info(f"[TIMING] MinIO upload: {upload_end - upload_start:.3f}s")

    # Save to Mongo
    db_start = time.time()
    try:
        submission_id = save_submission(full_size_url)
    except Exception as e:
        logger.error(f"MongoDB save failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Submission save failed")
    db_end = time.time()
    logger.info(f"[TIMING] MongoDB save: {db_end - db_start:.3f}s")

    total_end = time.time()
    logger.info(f"[TIMING] Total request time: {total_end - start_total:.3f}s")

    return JSONResponse(
        content={"status": "success", "image_url": full_size_url, "submission_id": str(submission_id)}
    )



app.include_router(api_router, prefix="/api/generate")
