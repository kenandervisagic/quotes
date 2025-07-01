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

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Assuming submissions_collection is your MongoDB collection
@api_router.get("/images")
async def get_images(
        limit: int = 5,
        sort: str = "date",
        start_after_id: str = None,
        start_after_likes: int = None
):
    try:
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

        cursor = submissions_collection.find(query_filter).sort(sort_fields).limit(limit)
        images_data = []
        last_id = None
        last_likes = None

        for doc in cursor:
            image_data = {
                "submission_id": str(doc["_id"]),
                "image_url": doc.get("image_url", ""),
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


@api_router.delete("/delete")
async def delete_submission(submission_id: str):
    try:
        # Convert the submission_id to an ObjectId
        try:
            obj_id = ObjectId(submission_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid submission_id format.")

        # Query the database to find the submission
        submission = submissions_collection.find_one({"_id": obj_id})

        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found.")

        # Delete the submission from the database
        submissions_collection.delete_one({"_id": obj_id})

        # Return a success response
        return JSONResponse(content={"status": "success", "message": "Submission deleted successfully"})

    except Exception as e:
        logger.error(f"Error deleting submission: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete submission: {str(e)}")

app.include_router(api_router, prefix="/api/admin")
