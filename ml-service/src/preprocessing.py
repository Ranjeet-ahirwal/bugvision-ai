import pandas as pd
import numpy as np

# -----------------------------------
# 1. Load original JM1 dataset
# -----------------------------------

df = pd.read_csv("data/jm1.csv")

print("Original dataset shape:", df.shape)


# -----------------------------------
# 2. Remove duplicate rows
# -----------------------------------

duplicates = df.duplicated().sum()

print("Duplicate rows found:", duplicates)

df = df.drop_duplicates().reset_index(drop=True)

print("Shape after removing duplicates:", df.shape)


# -----------------------------------
# 3. Convert numeric-looking columns
# -----------------------------------

numeric_columns = [
    "uniq_Op",
    "uniq_Opnd",
    "total_Op",
    "total_Opnd",
    "branchCount"
]

for column in numeric_columns:
    df[column] = pd.to_numeric(df[column], errors="coerce")


# -----------------------------------
# 4. Remove rows with invalid values
# -----------------------------------

invalid_rows = df[numeric_columns].isnull().any(axis=1).sum()

print("\nInvalid rows found:", invalid_rows)

df = df.dropna(subset=numeric_columns).reset_index(drop=True)

print("Shape after removing invalid rows:", df.shape)


# -----------------------------------
# 5. Convert target to 0/1
# -----------------------------------

df["defects"] = df["defects"].astype(int)


# -----------------------------------
# 6. Verify missing values
# -----------------------------------

print("\nMissing values after cleaning:")
print(df.isnull().sum())


# -----------------------------------
# 7. Save cleaned dataset
# -----------------------------------

df.to_csv("data/jm1_cleaned.csv", index=False)

print("\nCleaned dataset saved successfully!")

print("Final dataset shape:", df.shape)

print("\nFinal data types:")
print(df.dtypes)