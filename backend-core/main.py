import logging
import os

from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import DESCENDING

from mongo import submissions_collection

app = FastAPI(
    docs_url=None,
    redoc_url=None,
    openapi_url=None
)

logger = logging.getLogger("uvicorn")
api_router = APIRouter()

ENVIRONMENT = os.getenv("ENVIRONMENT", "")

if ENVIRONMENT == "local":
    origins = ["*"]
else:
    origins = ["https://kdidp.art", "https://www.kdidp.art"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# Health check
@api_router.get("/health", response_class=JSONResponse)
async def health():
    return {"status": "ok"}


# Assuming submissions_collection is your MongoDB collection
@api_router.get("/images")
async def get_images(
        sort: str = "date",
        start_after_id: str = None,
        start_after_likes: int = None
):
    limit = 5
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
                "thumbnail_url": doc.get("thumbnail_url", ""),
                "timestamp": doc.get("timestamp").isoformat() if doc.get("timestamp") else "",
                "likes": doc.get("likes", 0),
                "username": doc.get("username", "unknown")
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


app.include_router(api_router, prefix="/api/core")
