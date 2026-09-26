import pandas as pd

from sklearn.model_selection import StratifiedKFold, cross_val_predict

from sklearn.ensemble import HistGradientBoostingClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
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
# 3. Model
# ==========================================

model = HistGradientBoostingClassifier(
    max_iter=200,
    learning_rate=0.05,
    max_leaf_nodes=15,
    l2_regularization=1.0,
    random_state=42
)


# ==========================================
# 4. Stratified 5-Fold Cross Validation
# ==========================================

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


print("\nRunning 5-fold cross-validation...")

probabilities = cross_val_predict(
    model,
    X,
    y,
    cv=cv,
    method="predict_proba",
    n_jobs=-1
)[:, 1]

print("Cross-validation completed!")


# ==========================================
# 5. Overall ROC-AUC
# ==========================================

roc_auc = roc_auc_score(
    y,
    probabilities
)

print("\nCross-validated ROC-AUC:", round(roc_auc, 4))


# ==========================================
# 6. Test thresholds
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


print("\n========== CROSS-VALIDATED THRESHOLDS ==========")

print(
    "\nThreshold | Accuracy | Precision | Recall | F1"
)

print("-" * 55)


for threshold in thresholds:

    predictions = (
        probabilities >= threshold
    ).astype(int)

    accuracy = accuracy_score(
        y,
        predictions
    )

    precision = precision_score(
        y,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y,
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
# 7. Find best threshold by F1
# ==========================================

best_result = max(
    results,
    key=lambda x: x[4]
)


print("\n==========================================")
print("BEST CROSS-VALIDATED THRESHOLD")
print("==========================================")

print("Threshold :", best_result[0])
print("Accuracy  :", round(best_result[1], 4))
print("Precision :", round(best_result[2], 4))
print("Recall    :", round(best_result[3], 4))
print("F1 Score  :", round(best_result[4], 4))