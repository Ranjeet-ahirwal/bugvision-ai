import pandas as pd

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    GridSearchCV
)

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
# 2. Features and target
# -----------------------------------

X = df.drop(columns=["defects"])
y = df["defects"]


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
# 4. Pipeline
# -----------------------------------

pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),

    ("scaler", StandardScaler()),

    (
        "model",
        LogisticRegression(
            max_iter=3000,
            random_state=42
        )
    )
])


# -----------------------------------
# 5. Hyperparameter grid
# -----------------------------------

param_grid = {
    "model__C": [
        0.01,
        0.1,
        1,
        10,
        100
    ],

    "model__class_weight": [
        None,
        "balanced"
    ]
}


# -----------------------------------
# 6. Cross-validation
# -----------------------------------

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


# -----------------------------------
# 7. Grid Search
# -----------------------------------

grid_search = GridSearchCV(
    estimator=pipeline,
    param_grid=param_grid,
    scoring="f1",
    cv=cv,
    n_jobs=-1,
    verbose=1
)


print("Starting hyperparameter tuning...")

grid_search.fit(X_train, y_train)

print("\nTuning completed!")


# -----------------------------------
# 8. Best parameters
# -----------------------------------

print("\nBest parameters:")

print(grid_search.best_params_)

print("\nBest cross-validation F1:")

print(grid_search.best_score_)


# -----------------------------------
# 9. Evaluate on untouched test set
# -----------------------------------

best_model = grid_search.best_estimator_

y_pred = best_model.predict(X_test)

y_probability = best_model.predict_proba(X_test)[:, 1]


# -----------------------------------
# 10. Metrics
# -----------------------------------

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_probability)


print("\n========== FINAL TEST RESULTS ==========")

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")


# -----------------------------------
# 11. Confusion Matrix
# -----------------------------------

print("\nConfusion Matrix:")

print(confusion_matrix(y_test, y_pred))