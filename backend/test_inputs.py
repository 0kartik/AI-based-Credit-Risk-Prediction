import sys, os, pandas as pd, joblib
sys.path.append('c:/Users/HP/Desktop/Mini Project/Mini Project/backend')
from services.ml_service import predict_risk

inputs = [
    {'person_age': 25, 'person_income': 40000, 'person_emp_length': 2, 'cb_person_cred_hist_length': 3, 'loan_amnt': 5000, 'loan_int_rate': 10, 'loan_percent_income': 0.125, 'person_home_ownership': 'RENT', 'loan_intent': 'PERSONAL'},
    {'person_age': 35, 'person_income': 100000, 'person_emp_length': 10, 'cb_person_cred_hist_length': 12, 'loan_amnt': 10000, 'loan_int_rate': 5, 'loan_percent_income': 0.1, 'person_home_ownership': 'OWN', 'loan_intent': 'HOMEIMPROVEMENT'},
    {'person_age': 45, 'person_income': 200000, 'person_emp_length': 20, 'cb_person_cred_hist_length': 15, 'loan_amnt': 2000, 'loan_int_rate': 3, 'loan_percent_income': 0.01, 'person_home_ownership': 'MORTGAGE', 'loan_intent': 'EDUCATION'}
]

for i, data in enumerate(inputs):
    print(f'Input {i}: {predict_risk(data)["probability"]}')
