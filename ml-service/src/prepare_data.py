import pandas as pd
from sklearn.model_selection import train_test_split

# -----------------------------------
# 1. Load cleaned dataset
# -----------------------------------

df = pd.read_csv("data/jm1_cleaned.csv")

print("Dataset shape:", df.shape)


# -----------------------------------
# 2. Separate features and target
# -----------------------------------

X = df.drop(columns=["defects"])
y = df["defects"]


print("\nFeature shape:", X.shape)
print("Target shape:", y.shape)


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
# 4. Display split information
# -----------------------------------

print("\nTraining set:")
print("X_train:", X_train.shape)
print("y_train:", y_train.shape)

print("\nTesting set:")
print("X_test:", X_test.shape)
print("y_test:", y_test.shape)


# -----------------------------------
# 5. Check target distribution
# -----------------------------------

print("\nTraining target distribution:")
print(y_train.value_counts())

print("\nTesting target distribution:")
print(y_test.value_counts())

print("\nTraining target percentage:")
print(y_train.value_counts(normalize=True) * 100)

print("\nTesting target percentage:")
print(y_test.value_counts(normalize=True) * 100)