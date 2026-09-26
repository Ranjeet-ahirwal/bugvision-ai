import pandas as pd

# -----------------------------------
# 1. Load cleaned dataset
# -----------------------------------

df = pd.read_csv("data/jm1_cleaned.csv")


# -----------------------------------
# 2. Remove target
# -----------------------------------

X = df.drop(columns=["defects"])


# -----------------------------------
# 3. Calculate correlation matrix
# -----------------------------------

correlation_matrix = X.corr()


# -----------------------------------
# 4. Find highly correlated pairs
# -----------------------------------

threshold = 0.90

high_correlations = []

columns = correlation_matrix.columns

for i in range(len(columns)):
    for j in range(i + 1, len(columns)):

        correlation = correlation_matrix.iloc[i, j]

        if abs(correlation) >= threshold:

            high_correlations.append(
                (
                    columns[i],
                    columns[j],
                    correlation
                )
            )


# -----------------------------------
# 5. Display results
# -----------------------------------

print("Highly correlated feature pairs")
print(f"Threshold: |correlation| >= {threshold}")
print()

if high_correlations:

    for feature1, feature2, correlation in high_correlations:

        print(
            f"{feature1} <--> {feature2} : "
            f"{correlation:.4f}"
        )

else:

    print("No highly correlated feature pairs found.")