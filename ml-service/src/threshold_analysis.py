import pandas as pd

from sklearn.model_selection import train_test_split

from sklearn.ensemble import HistGradientBoostingClassifier

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    accuracy_score,
    roc_auc_score
)


# -----------------------------------
# 1. Load dataset
# -----------------------------------

df = pd.read_csv("data/jm1_cleaned.csv")

X = df.drop(columns=["defects"])
y = df["defects"]


# -----------------------------------
# 2. Train/Test split
# -----------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42
)


# -----------------------------------
# 3. Train Gradient Boosting
# -----------------------------------

model = HistGradientBoostingClassifier(
    max_iter=200,
    learning_rate=0.05,
    max_leaf_nodes=15,
    l2_regularization=1.0,
    random_state=42
)

print("Training model...")

model.fit(X_train, y_train)

print("Training completed!")


# -----------------------------------
# 4. Get probabilities
# -----------------------------------

probabilities = model.predict_proba(X_test)[:, 1]


print("\nROC-AUC:", round(
    roc_auc_score(y_test, probabilities), 4
))


# -----------------------------------
# 5. Test different thresholds
# -----------------------------------

thresholds = [
    0.20,
    0.25,
    0.30,
    0.35,
    0.40,
    0.45,
    0.50
]


print("\n========== THRESHOLD ANALYSIS ==========")

print(
    "\nThreshold | Accuracy | Precision | Recall | F1"
)

print("-" * 55)


for threshold in thresholds:

    predictions = (
        probabilities >= threshold
    ).astype(int)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    print(
        f"{threshold:9.2f} | "
        f"{accuracy:8.4f} | "
        f"{precision:9.4f} | "
        f"{recall:6.4f} | "
        f"{f1:6.4f}"
    )