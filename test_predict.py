import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from backend.services.ml_service import predict_risk

data = {
    "person_age": 25,
    "person_income": 50000,
    "loan_amnt": 10000,
    "person_home_ownership": "RENT",
    "loan_intent": "EDUCATION",
    "loan_grade": "A",
    "person_emp_length": 2,
    "loan_int_rate": 8.5
}

try:
    result = predict_risk(data)
    print("Prediction Result:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
