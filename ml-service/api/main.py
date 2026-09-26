from fastapi.responses import FileResponse
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import pandas as pd
import joblib
import json
import os
from io import BytesIO


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="BugVision AI ML Service",
    description="AI-based software bug prediction service",
    version="1.1.0"
)


# ============================================================
# Model Configuration
# ============================================================

MODEL_PATH = "models/bug_prediction_model.joblib"
METADATA_PATH = "models/model_metadata.json"

REPORTS_DIR = "reports"

os.makedirs(REPORTS_DIR, exist_ok=True)


if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

if not os.path.exists(METADATA_PATH):
    raise FileNotFoundError(f"Metadata file not found: {METADATA_PATH}")


# Load trained model
model = joblib.load(MODEL_PATH)


# Load model metadata
with open(METADATA_PATH, "r") as file:
    metadata = json.load(file)


FEATURES = metadata["features"]
THRESHOLD = metadata["classification_threshold"]


# ============================================================
# Risk Classification
# ============================================================

def get_risk_level(probability: float) -> str:
    """
    Convert defect probability into a UI risk category.

    These are product-level risk labels and are separate from
    the model's classification threshold.
    """

    if probability >= 0.60:
        return "HIGH"

    elif probability >= 0.30:
        return "MEDIUM"

    else:
        return "LOW"


# ============================================================
# Prediction Input Schema
# ============================================================

class PredictionInput(BaseModel):

    loc: float
    v_g: float
    ev_g: float
    iv_g: float

    n: float
    v: float
    l: float
    d: float
    i: float
    e: float
    b: float
    t: float

    lOCode: float
    lOComment: float
    lOBlank: float
    locCodeAndComment: float

    uniq_Op: float
    uniq_Opnd: float
    total_Op: float
    total_Opnd: float
    branchCount: float


# ============================================================
# Root Endpoint
# ============================================================

@app.get("/")
def root():

    return {
        "service": "BugVision AI ML Service",
        "status": "running",
        "version": "1.1.0",
        "model": metadata["model_name"]
    }


# ============================================================
# Model Information
# ============================================================

@app.get("/model-info")
def model_info():

    return {
        "model_name": metadata["model_name"],
        "model_type": metadata["model_type"],
        "dataset": metadata["dataset"],
        "dataset_records": metadata["dataset_records"],
        "feature_count": metadata["feature_count"],
        "classification_threshold": THRESHOLD
    }


# ============================================================
# Single Prediction
# ============================================================

@app.post("/predict")
def predict(data: PredictionInput):

    # Convert request data into dictionary
    input_data = data.model_dump()

    # Convert API field names back to dataset names
    input_data["v(g)"] = input_data.pop("v_g")
    input_data["ev(g)"] = input_data.pop("ev_g")
    input_data["iv(g)"] = input_data.pop("iv_g")

    # Create DataFrame
    df = pd.DataFrame([input_data])

    # Ensure exact feature order
    df = df[FEATURES]

    # Predict probability
    probability = float(model.predict_proba(df)[0][1])

    # Classification
    prediction = (
        "Defective"
        if probability >= THRESHOLD
        else "Non-Defective"
    )

    # Risk level
    risk_level = get_risk_level(probability)

    return {
        "defect_probability": round(probability, 4),
        "prediction": prediction,
        "risk_level": risk_level,
        "classification_threshold": THRESHOLD
    }


# ============================================================
# CSV Prediction
# ============================================================

@app.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...)):

    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    if not file.filename.lower().endswith(".csv"):

        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported."
        )


    # --------------------------------------------------------
    # Read uploaded CSV
    # --------------------------------------------------------

    contents = await file.read()

    try:

        df = pd.read_csv(BytesIO(contents))

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV file: {str(error)}"
        )


    # --------------------------------------------------------
    # Validate empty CSV
    # --------------------------------------------------------

    if df.empty:

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV file is empty."
        )


    # --------------------------------------------------------
    # Detect optional component identifier
    # --------------------------------------------------------

    component_column = None

    possible_component_columns = [
        "component",
        "component_name",
        "module",
        "module_name",
        "file",
        "file_name",
        "filename",
        "class",
        "class_name"
    ]

    for column in possible_component_columns:

        if column in df.columns:

            component_column = column
            break


    # --------------------------------------------------------
    # Validate required ML features
    # --------------------------------------------------------

    missing_columns = [
        column
        for column in FEATURES
        if column not in df.columns
    ]

    if missing_columns:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Required columns are missing.",
                "missing_columns": missing_columns
            }
        )


    # --------------------------------------------------------
    # Prepare feature data
    # --------------------------------------------------------

    feature_df = df[FEATURES].copy()

    # Convert every feature to numeric
    for column in FEATURES:

        feature_df[column] = pd.to_numeric(
            feature_df[column],
            errors="coerce"
        )


    # --------------------------------------------------------
    # Validate invalid values
    # --------------------------------------------------------

    invalid_rows = feature_df.isnull().any(axis=1)

    invalid_row_count = int(invalid_rows.sum())


    if invalid_row_count > 0:

        invalid_row_numbers = (
            feature_df.index[invalid_rows] + 1
        ).tolist()

        raise HTTPException(
            status_code=400,
            detail={
                "message": "CSV contains missing or invalid feature values.",
                "invalid_row_count": invalid_row_count,
                "invalid_rows": invalid_row_numbers
            }
        )


    # --------------------------------------------------------
    # Generate predictions
    # --------------------------------------------------------

    probabilities = model.predict_proba(feature_df)[:, 1]


    # --------------------------------------------------------
    # Build results
    # --------------------------------------------------------


    results = []

    for index, probability in enumerate(probabilities):

        probability = float(probability)

        prediction = (
            "Defective"
            if probability >= THRESHOLD
            else "Non-Defective"
        )

        risk_level = get_risk_level(probability)

        result = {
            "row": index + 1,
            "defect_probability": round(probability, 4),
            "prediction": prediction,
            "risk_level": risk_level
        }

        # Add component name if available
        if component_column:

            component_value = df.iloc[index][component_column]

            if pd.notna(component_value):

                result["component"] = str(component_value)

            else:

                result["component"] = f"Component-{index + 1}"

        else:

            result["component"] = f"Component-{index + 1}"

        results.append(result)


    # --------------------------------------------------------
    # Create downloadable prediction report
    # --------------------------------------------------------

    report_df = pd.DataFrame(results)

    report_filename = "prediction_report.csv"

    report_path = os.path.join(
        REPORTS_DIR,
        report_filename
    )

    report_df.to_csv(
        report_path,
        index=False
    )


    # --------------------------------------------------------
    # Summary statistics
    # --------------------------------------------------------

    defective_count = sum(
        1
        for result in results
        if result["prediction"] == "Defective"
    )

    non_defective_count = (
        len(results) - defective_count
    )


    high_risk_count = sum(
        1
        for result in results
        if result["risk_level"] == "HIGH"
    )

    medium_risk_count = sum(
        1
        for result in results
        if result["risk_level"] == "MEDIUM"
    )

    low_risk_count = sum(
        1
        for result in results
        if result["risk_level"] == "LOW"
    )


    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {

        "filename": file.filename,

        "total_rows": len(results),

        "component_column": component_column,

        "defective_count": defective_count,

        "non_defective_count": non_defective_count,

        "risk_summary": {
            "high": high_risk_count,
            "medium": medium_risk_count,
            "low": low_risk_count
        },

        "classification_threshold": THRESHOLD,

        "report": {
            "filename": report_filename,
            "download_url": f"/download-predictions/{report_filename}"
        },

        "results": results
    }
    
    # ============================================================
# Download Prediction Report
# ============================================================

@app.get("/download-predictions/{filename}")
def download_predictions(filename: str):

    # Prevent directory traversal
    if "/" in filename or "\\" in filename or ".." in filename:

        raise HTTPException(
            status_code=400,
            detail="Invalid filename."
        )

    file_path = os.path.join(
        REPORTS_DIR,
        filename
    )

    if not os.path.exists(file_path):

        raise HTTPException(
            status_code=404,
            detail="Prediction report not found."
        )

    return FileResponse(
        path=file_path,
        media_type="text/csv",
        filename=filename
    )