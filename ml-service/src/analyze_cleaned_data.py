import pandas as pd

# -----------------------------------
# 1. Load cleaned dataset
# -----------------------------------

df = pd.read_csv("data/jm1_cleaned.csv")

print("Dataset shape:", df.shape)


# -----------------------------------
# 2. Target distribution
# -----------------------------------

print("\nTarget distribution:")
print(df["defects"].value_counts())

print("\nTarget percentage:")
print(df["defects"].value_counts(normalize=True) * 100)


# -----------------------------------
# 3. Feature statistics
# -----------------------------------

print("\nFeature statistics:")
print(df.describe().T)


# -----------------------------------
# 4. Data types
# -----------------------------------

print("\nData types:")
print(df.dtypes)


# -----------------------------------
# 5. Correlation with target
# -----------------------------------

print("\nCorrelation with defects:")

correlation = df.corr(numeric_only=True)["defects"].sort_values(
    ascending=False
)

print(correlation)