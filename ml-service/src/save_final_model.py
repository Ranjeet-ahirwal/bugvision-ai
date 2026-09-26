import os
import json
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier
import joblib


# ==========================================
# 1. Load cleaned dataset
# ==========================================

df = pd.read_csv("data/jm1_cleaned.csv")

print("Dataset shape:", df.shape)


# ==========================================
# 2. Separate features and target
# ==========================================

X = df.drop(columns=["defects"])
y = df["defects"]

feature_names = X.columns.tolist()


print("\nNumber of features:", len(feature_names))

print("\nFeatures:")
for feature in feature_names:
    print("-", feature)


# ==========================================
# 3. Create development/test split
# ==========================================

X_dev, X_test, y_dev, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42
)


print("\nDevelopment dataset:", X_dev.shape)
print("Test dataset:", X_test.shape)


# ==========================================
# 4. Define final model
# ==========================================

model = HistGradientBoostingClassifier(
    max_iter=200,
    learning_rate=0.05,
    max_leaf_nodes=15,
    l2_regularization=1.0,
    random_state=42
)


# ==========================================
# 5. Train final model
# ==========================================

print("\nTraining final model...")

model.fit(
    X_dev,
    y_dev
)

print("Training completed!")


# ==========================================
# 6. Create models directory
# ==========================================

os.makedirs("models", exist_ok=True)


# ==========================================
# 7. Save model
# ==========================================

model_path = "models/bug_prediction_model.joblib"

joblib.dump(
    model,
    model_path
)

print("\nModel saved successfully!")
print("Location:", model_path)


# ==========================================
# 8. Save model metadata
# ==========================================

metadata = {
    "model_name": "BugVision AI Defect Prediction Model",
    "model_type": "HistGradientBoostingClassifier",
    "dataset": "NASA JM1",
    "dataset_records": int(len(df)),
    "training_records": int(len(X_dev)),
    "test_records": int(len(X_test)),
    "feature_count": len(feature_names),
    "features": feature_names,
    "classification_threshold": 0.20,
    "max_iter": 200,
    "learning_rate": 0.05,
    "max_leaf_nodes": 15,
    "l2_regularization": 1.0,
    "random_state": 42
}


metadata_path = "models/model_metadata.json"

with open(metadata_path, "w") as file:
    json.dump(
        metadata,
        file,
        indent=4
    )


print("Metadata saved successfully!")
print("Location:", metadata_path)


# ==========================================
# 9. Final summary
# ==========================================

print("\n==========================================")
print("MODEL FINALIZATION COMPLETE")
print("==========================================")

print("Model :", model_path)
print("Metadata:", metadata_path)
print("Threshold:", metadata["classification_threshold"])
print("Features:", metadata["feature_count"])