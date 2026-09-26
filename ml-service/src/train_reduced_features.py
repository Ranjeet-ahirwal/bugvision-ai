import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)


# -----------------------------------
# 1. Load dataset
# -----------------------------------

df = pd.read_csv("data/jm1_cleaned.csv")


# -----------------------------------
# 2. Remove highly redundant features
# -----------------------------------

features_to_remove = [
    "lOCode",
    "branchCount",
    "v",
    "b",
    "total_Op",
    "total_Opnd",
    "t"
]

X = df.drop(columns=["defects"] + features_to_remove)

y = df["defects"]


print("Remaining features:")
print(X.columns.tolist())

print("\nNumber of features:", X.shape[1])


# -----------------------------------
# 3. Train/Test split
# -----------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42
)


# -----------------------------------
# 4. Logistic Regression pipeline
# -----------------------------------

model = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),

    ("scaler", StandardScaler()),

    (
        "model",
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=42
        )
    )
])


# -----------------------------------
# 5. Train
# -----------------------------------

print("\nTraining reduced-feature Logistic Regression...")

model.fit(X_train, y_train)


# -----------------------------------
# 6. Predictions
# -----------------------------------

y_pred = model.predict(X_test)

y_probability = model.predict_proba(X_test)[:, 1]


# -----------------------------------
# 7. Evaluation
# -----------------------------------

print("\n========== RESULTS ==========")

print(
    f"Accuracy : "
    f"{accuracy_score(y_test, y_pred):.4f}"
)

print(
    f"Precision: "
    f"{precision_score(y_test, y_pred):.4f}"
)

print(
    f"Recall   : "
    f"{recall_score(y_test, y_pred):.4f}"
)

print(
    f"F1 Score : "
    f"{f1_score(y_test, y_pred):.4f}"
)

print(
    f"ROC-AUC  : "
    f"{roc_auc_score(y_test, y_probability):.4f}"
)


# -----------------------------------
# 8. Confusion Matrix
# -----------------------------------

print("\nConfusion Matrix:")

print(confusion_matrix(y_test, y_pred))