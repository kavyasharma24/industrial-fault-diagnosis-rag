
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ml_service import predict_failure


router = APIRouter()


# Sensor input schema
class SensorInput(BaseModel):

    Air_Temperature: float
    Process_Temperature: float
    Rotational_Speed: float
    Torque: float
    Tool_Wear: float


# Machine failure prediction endpoint
@router.post("/predict")
def predict_machine_failure(sensor: SensorInput):

    sensor_data = sensor.model_dump()

    result = predict_failure(sensor_data)

    return {
        "status": "success",
        "input_data": sensor_data,
        "prediction_result": result
    }
