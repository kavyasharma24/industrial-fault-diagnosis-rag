
from fastapi import APIRouter

# Create an API router
router = APIRouter()


# Health check endpoint
@router.get("/health")
def health_check():

    return {
        "status": "healthy",
        "message": "Industrial Fault Diagnosis Backend is running!"
    }
