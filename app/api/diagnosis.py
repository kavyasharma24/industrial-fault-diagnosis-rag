
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ml_service import predict_failure
from app.services.rag_service import search_knowledge
from app.services.kg_service import (
    evaluate_failure_conditions,
    get_failure_mode_details
)
from app.services.llm_service import generate_diagnosis


router = APIRouter(
    prefix="/diagnosis",
    tags=["Combined Industrial Diagnosis"]
)


class DiagnosisInput(BaseModel):
    Air_Temperature: float
    Process_Temperature: float
    Rotational_Speed: float
    Torque: float
    Tool_Wear: float

    query: str = Field(
        default="What are the possible causes of industrial machine failure?"
    )

    top_k: int = Field(default=3, ge=1, le=6)

    product_quality: str | None = None


@router.post("/analyze")
def analyze_machine(input_data: DiagnosisInput):

    try:

        # 1. Prepare sensor data
        sensor_data = {
            "Air_Temperature": input_data.Air_Temperature,
            "Process_Temperature": input_data.Process_Temperature,
            "Rotational_Speed": input_data.Rotational_Speed,
            "Torque": input_data.Torque,
            "Tool_Wear": input_data.Tool_Wear
        }

        # 2. ML prediction
        prediction_result = predict_failure(sensor_data)

        # 3. RAG knowledge retrieval
        knowledge_results = search_knowledge(
            query=input_data.query,
            top_k=input_data.top_k
        )

        # 4. Knowledge Graph rule evaluation
        kg_results = evaluate_failure_conditions(
            sensor_data=sensor_data,
            product_quality=input_data.product_quality
        )

        # 5. Retrieve graph-linked details
        graph_details = {}

        for code, result in kg_results["results"].items():

            failure_mode_id = f"FM_{code}"

            details = get_failure_mode_details(
                failure_mode_id
            )

            if details is not None:
                graph_details[code] = details

        # 6. Generate AI diagnosis using Groq LLM
        llm_result = generate_diagnosis(
            sensor_data=sensor_data,
            ml_prediction=prediction_result,
            rag_knowledge=knowledge_results,
            kg_evaluation=kg_results,
            kg_details=graph_details
        )

        # 7. Return combined diagnosis
        return {
            "status": "success",
            "sensor_data": sensor_data,
            "ml_prediction": prediction_result,
            "rag_retrieved_knowledge": knowledge_results,
            "knowledge_graph_evaluation": kg_results,
            "knowledge_graph_details": graph_details,
            "llm_diagnosis": llm_result
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
