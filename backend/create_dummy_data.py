import pandas as pd
import numpy as np

np.random.seed(42)

n_samples = 1000

data = {
    'person_age': np.random.randint(20, 70, n_samples),
    'person_income': np.random.randint(20000, 150000, n_samples),
    'person_home_ownership': np.random.choice(['RENT', 'OWN', 'MORTGAGE', 'OTHER'], n_samples),
    'person_emp_length': np.random.randint(0, 40, n_samples),
    'loan_intent': np.random.choice(['PERSONAL', 'EDUCATION', 'MEDICAL', 'VENTURE', 'HOMEIMPROVEMENT', 'DEBTCONSOLIDATION'], n_samples),
    'loan_amnt': np.random.randint(1000, 35000, n_samples),
    'loan_int_rate': np.round(np.random.uniform(5.0, 20.0, n_samples), 2),
    'cb_person_cred_hist_length': np.random.randint(2, 30, n_samples)
}

df = pd.DataFrame(data)

# Simple rule to generate target (loan_status): higher loan amount + lower income = higher chance of default
# 1 = default, 0 = no default
df['loan_percent_income'] = df['loan_amnt'] / df['person_income']

prob_default = (df['loan_percent_income'] * 0.5) + (df['loan_int_rate'] / 20.0 * 0.3)
prob_default += np.where(df['person_home_ownership'] == 'RENT', 0.1, 0)
prob_default += np.where(df['person_emp_length'] < 2, 0.1, 0)

# Add noise for probabilistic models
prob_default += np.random.normal(0, 0.1, n_samples)

df['loan_status'] = np.where(prob_default > 0.45, 1, 0)

# Save to CSV
df.to_csv('dummy_dataset.csv', index=False)
print("Saved dummy_dataset.csv with 1000 records.")
