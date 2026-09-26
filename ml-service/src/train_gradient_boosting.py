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


# -----------------------------------
# 1. Load dataset
# -----------------------------------

df = pd.read_csv("data/jm1_cleaned.csv")

print("Dataset shape:", df.shape)


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
# 4. Gradient Boosting model
# -----------------------------------

model = HistGradientBoostingClassifier(
    max_iter=200,
    learning_rate=0.05,
    max_leaf_nodes=15,
    l2_regularization=1.0,
    random_state=42
)


# -----------------------------------
# 5. Training
# -----------------------------------

print("\nTraining Gradient Boosting...")

model.fit(X_train, y_train)

print("Training completed!")


# -----------------------------------
# 6. Predictions
# -----------------------------------

y_pred = model.predict(X_test)

y_probability = model.predict_proba(X_test)[:, 1]


# -----------------------------------
# 7. Evaluation
# -----------------------------------

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_probability)


print("\n========== RESULTS ==========")

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")


# -----------------------------------
# 8. Confusion Matrix
# -----------------------------------

print("\nConfusion Matrix:")

print(confusion_matrix(y_test, y_pred))