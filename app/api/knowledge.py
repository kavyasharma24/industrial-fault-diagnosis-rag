
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.rag_service import search_knowledge


router = APIRouter(
    prefix="/knowledge",
    tags=["Industrial Knowledge Retrieval"]
)


class KnowledgeQuery(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=3, ge=1, le=6)


@router.post("/search")
def retrieve_knowledge(request: KnowledgeQuery):

    try:
        results = search_knowledge(
            query=request.query,
            top_k=request.top_k
        )

        return {
            "status": "success",
            "query": request.query,
            "total_results": len(results),
            "results": results
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
