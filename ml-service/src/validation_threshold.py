import pandas as pd

from sklearn.model_selection import train_test_split

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
# 2. Separate features and target
# ==========================================

X = df.drop(columns=["defects"])
y = df["defects"]


# ==========================================
# 3. Create final TEST set
# ==========================================

X_dev, X_test, y_dev, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42
)


# ==========================================
# 4. Split development data
#    into TRAIN + VALIDATION
# ==========================================

X_train, X_val, y_train, y_val = train_test_split(
    X_dev,
    y_dev,
    test_size=0.25,
    stratify=y_dev,
    random_state=42
)


print("\nDataset split:")
print("Training   :", X_train.shape)
print("Validation :", X_val.shape)
print("Test       :", X_test.shape)


# ==========================================
# 5. Train Gradient Boosting
# ==========================================

model = HistGradientBoostingClassifier(
    max_iter=200,
    learning_rate=0.05,
    max_leaf_nodes=15,
    l2_regularization=1.0,
    random_state=42
)


print("\nTraining Gradient Boosting...")

model.fit(X_train, y_train)

print("Training completed!")


# ==========================================
# 6. Validation probabilities
# ==========================================

val_probability = model.predict_proba(X_val)[:, 1]


print("\nValidation ROC-AUC:")

print(
    round(
        roc_auc_score(y_val, val_probability),
        4
    )
)


# ==========================================
# 7. Find best threshold using VALIDATION
# ==========================================

thresholds = [
    0.10,
    0.15,
    0.20,
    0.25,
    0.30,
    0.35,
    0.40,
    0.45,
    0.50
]


results = []


print("\n========== VALIDATION THRESHOLD ANALYSIS ==========")

print(
    "\nThreshold | Accuracy | Precision | Recall | F1"
)

print("-" * 55)


for threshold in thresholds:

    val_pred = (
        val_probability >= threshold
    ).astype(int)

    accuracy = accuracy_score(
        y_val,
        val_pred
    )

    precision = precision_score(
        y_val,
        val_pred,
        zero_division=0
    )

    recall = recall_score(
        y_val,
        val_pred,
        zero_division=0
    )

    f1 = f1_score(
        y_val,
        val_pred,
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
# 8. Select threshold based on validation F1
# ==========================================

best_result = max(
    results,
    key=lambda x: x[4]
)

best_threshold = best_result[0]

print("\n==========================================")
print("BEST VALIDATION THRESHOLD")
print("==========================================")

print("Threshold :", best_threshold)
print("Accuracy  :", round(best_result[1], 4))
print("Precision :", round(best_result[2], 4))
print("Recall    :", round(best_result[3], 4))
print("F1 Score  :", round(best_result[4], 4))


# ==========================================
# 9. Evaluate ONLY ONCE on final test set
# ==========================================

test_probability = model.predict_proba(X_test)[:, 1]

test_pred = (
    test_probability >= best_threshold
).astype(int)


accuracy = accuracy_score(
    y_test,
    test_pred
)

precision = precision_score(
    y_test,
    test_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    test_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    test_pred,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    test_probability
)


# ==========================================
# 10. Final test results
# ==========================================

print("\n==========================================")
print("FINAL TEST RESULTS")
print("==========================================")

print("Selected threshold:", best_threshold)

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")


print("\nConfusion Matrix:")

print(
    confusion_matrix(
        y_test,
        test_pred
    )
)