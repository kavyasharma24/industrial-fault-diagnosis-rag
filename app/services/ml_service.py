
from pathlib import Path

import joblib
import xgboost
import pandas as pd

# Project root directory
BASE_DIR = Path(__file__).resolve().parents[2]

# ML artifact paths
ML_ARTIFACTS_DIR = BASE_DIR / "artifacts" / "ml"

MODEL_PATH = ML_ARTIFACTS_DIR / "xgboost_failure_model.json"
METADATA_PATH = ML_ARTIFACTS_DIR / "model_info.joblib"


# Load model metadata
model_metadata = joblib.load(METADATA_PATH)

# Load trained XGBoost model
failure_model = xgboost.XGBClassifier()
failure_model.load_model(str(MODEL_PATH))

# Original feature order
FEATURE_NAMES = model_metadata["features"]


def get_model_info():

    return {
        "model_type": model_metadata["model"],
        "target": model_metadata["target"],
        "features": FEATURE_NAMES,
        "number_of_features": failure_model.n_features_in_,
        "classes": failure_model.classes_.tolist()
    }

def predict_failure(sensor_data):

    # Arrange sensor values in the original training feature order
    input_data = pd.DataFrame(
        [sensor_data],
        columns=FEATURE_NAMES
    )

    # Generate prediction
    prediction = int(failure_model.predict(input_data)[0])

    # Generate class probabilities
    probabilities = failure_model.predict_proba(input_data)[0]

    return {
        "prediction": prediction,
        "prediction_label": (
            "Machine Failure" if prediction == 1
            else "No Machine Failure"
        ),
        "probabilities": {
            str(int(class_label)): float(probability)
            for class_label, probability
            in zip(failure_model.classes_, probabilities)
        }
    }
