import pandas as pd
from clients import supabase

df = pd.read_csv("my-work-outs.csv")

df.drop(
    columns=["RPE", "Distance (meters)", "Seconds", "Notes", "Workout Notes"],
    inplace=True,
)

df = df[df["Set Order"] != "W"]
df = df[pd.to_numeric(df["Set Order"], errors="coerce").notna()]
df["Set Order"] = df["Set Order"].astype(int)
df["Date"] = pd.to_datetime(df["Date"])
df["Reps"] = df["Reps"].fillna(0).astype(int)

# Clean column names first
df.columns = (
    df.columns.str.strip()
    .str.lower()
    .str.replace(" ", "_")
    .str.replace("(", "")
    .str.replace(")", "")
)

# Rename workout_# after column cleaning
df = df.rename(columns={"workout_#": "workout_number"})

# Replace NaN with None AFTER all cleaning
import numpy as np

df = df.replace({np.nan: None})

# Convert to records
records = df.to_dict(orient="records")

# Convert dates to strings
for record in records:
    record["date"] = str(record["date"])

# Insert in batches
BATCH_SIZE = 500
total = len(records)

for i in range(0, total, BATCH_SIZE):
    batch = records[i : i + BATCH_SIZE]
    supabase.table("workouts").insert(batch).execute()
    print(f"Inserted {min(i + BATCH_SIZE, total)} / {total} records")

print("Seed complete")
