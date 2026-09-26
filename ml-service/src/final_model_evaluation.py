import pandas as pd

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_predict
)

from sklearn.ensemble import HistGradientBoostingClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)


# ==========================================
# 1. Load dataset
# ==========================================

df = pd.read_csv("data/jm1_cleaned.csv")

print("Dataset shape:", df.shape)


# ==========================================
# 2. Features and target
# ==========================================

X = df.drop(columns=["defects"])
y = df["defects"]


# ==========================================
# 3. Create FINAL TEST SET
# ==========================================

X_dev, X_test, y_dev, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42
)


print("\nDataset split:")
print("Development:", X_dev.shape)
print("Final Test :", X_test.shape)


# ==========================================
# 4. Define model
# ==========================================

model = HistGradientBoostingClassifier(
    max_iter=200,
    learning_rate=0.05,
    max_leaf_nodes=15,
    l2_regularization=1.0,
    random_state=42
)


# ==========================================
# 5. Cross-validation ONLY on development data
# ==========================================

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


print("\nGenerating cross-validated probabilities...")

dev_probabilities = cross_val_predict(
    model,
    X_dev,
    y_dev,
    cv=cv,
    method="predict_proba",
    n_jobs=-1
)[:, 1]

print("Cross-validation completed!")


# ==========================================
# 6. Find threshold using DEVELOPMENT data
# ==========================================

thresholds = [
    0.10,
    0.15,
    0.20,
    0.25,
    0.30,
    0.35,
    0.40
]


results = []


print("\n========== DEVELOPMENT THRESHOLD ANALYSIS ==========")

print(
    "\nThreshold | Accuracy | Precision | Recall | F1"
)

print("-" * 55)


for threshold in thresholds:

    predictions = (
        dev_probabilities >= threshold
    ).astype(int)

    accuracy = accuracy_score(
        y_dev,
        predictions
    )

    precision = precision_score(
        y_dev,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_dev,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_dev,
        predictions,
        zero_division=0
    )

    results.append(
        (
            threshold,
            accuracy,
            precision,
            recall,
            f1
        )
    )

    print(
        f"{threshold:9.2f} | "
        f"{accuracy:8.4f} | "
        f"{precision:9.4f} | "
        f"{recall:6.4f} | "
        f"{f1:6.4f}"
    )


# ==========================================
# 7. Select threshold
# ==========================================

best_result = max(
    results,
    key=lambda x: x[4]
)

best_threshold = best_result[0]


print("\n==========================================")
print("SELECTED THRESHOLD")
print("==========================================")

print("Threshold :", best_threshold)
print("F1 Score  :", round(best_result[4], 4))


# ==========================================
# 8. Train final model on ALL development data
# ==========================================

print("\nTraining final model on development data...")

model.fit(
    X_dev,
    y_dev
)

print("Final model training completed!")


# ==========================================
# 9. Predict FINAL TEST SET
# ==========================================

test_probability = model.predict_proba(
    X_test
)[:, 1]


test_prediction = (
    test_probability >= best_threshold
).astype(int)


# ==========================================
# 10. Final evaluation
# ==========================================

accuracy = accuracy_score(
    y_test,
    test_prediction
)

precision = precision_score(
    y_test,
    test_prediction,
    zero_division=0
)

recall = recall_score(
    y_test,
    test_prediction,
    zero_division=0
)

f1 = f1_score(
    y_test,
    test_prediction,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    test_probability
)


print("\n==========================================")
print("FINAL TEST RESULTS")
print("==========================================")

print("Selected threshold:", best_threshold)

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")


# ==========================================
# 11. Confusion Matrix
# ==========================================

print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        test_prediction
    )
)