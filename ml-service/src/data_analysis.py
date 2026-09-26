import pandas as pd
import numpy as np

# Load JM1 dataset
df = pd.read_csv("data/jm1.csv")

print("Dataset shape:", df.shape)

print("\nFirst 5 rows:")
print(df.head())

print("\nColumn information:")
df.info()

print("\nTarget distribution:")
print(df["defects"].value_counts())

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate rows:")
print(df.duplicated().sum())