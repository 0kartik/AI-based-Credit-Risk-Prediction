import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
import json

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'ml_models')

def train_models(dataset_path):
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Load data
    df = pd.read_csv(dataset_path)
    
    # Simple validation - expecting specific columns as per implementation plan
    # person_age, person_income, loan_amnt, loan_status, etc.
    # In a real generic classifier, this would detect target column dynamically.
    target = 'loan_status'
    if target not in df.columns:
        raise ValueError(f"Dataset must contain target column: {target}")
        
    X = df.drop(columns=[target])
    y = df[target]
    
    # Need to handle categoricals
    X = pd.get_dummies(X)
    
    # Scale numerical features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Save the scaler and columns
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))
    joblib.dump(X.columns.tolist(), os.path.join(MODELS_DIR, 'columns.pkl'))
    
    # Train test split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    results = {}
    
    # 1. Logistic Regression
    lr = LogisticRegression()
    lr.fit(X_train, y_train)
    score_lr = lr.score(X_test, y_test)
    joblib.dump(lr, os.path.join(MODELS_DIR, 'logistic_regression.pkl'))
    results['Logistic Regression'] = score_lr
    
    # 2. Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    score_rf = rf.score(X_test, y_test)
    joblib.dump(rf, os.path.join(MODELS_DIR, 'random_forest.pkl'))
    results['Random Forest'] = score_rf
    
    # 3. XGBoost
    xgb = XGBClassifier(eval_metric='logloss')
    xgb.fit(X_train, y_train)
    score_xgb = xgb.score(X_test, y_test)
    joblib.dump(xgb, os.path.join(MODELS_DIR, 'xgboost.pkl'))
    results['XGBoost'] = score_xgb
    
    return results

def predict_risk(data):
    """
    data is a dictionary of features: e.g. {"person_age": 25, "person_income": 50000, "loan_amnt": 10000}
    returns: {"probability": 0.85, "label": "High Risk", "factors": ["High loan to income ratio", "Short employment length"]}
    """
    scaler_path = os.path.join(MODELS_DIR, 'scaler.pkl')
    cols_path = os.path.join(MODELS_DIR, 'columns.pkl')
    model_path = os.path.join(MODELS_DIR, 'xgboost.pkl') # Use best model
    
    if not os.path.exists(model_path):
        raise Exception("Models not trained yet. Please ask Admin to upload dataset and train.")
        
    scaler = joblib.load(scaler_path)
    cols = joblib.load(cols_path)
    model = joblib.load(model_path)
    
    # Preprocess incoming data
    # Set safe defaults for missing fields that were present in original datasets
    if 'cb_person_default_on_file' not in data:
        data['cb_person_default_on_file'] = 'N'
    if 'loan_grade' not in data:
        data['loan_grade'] = 'B'  # Safe average grade
        
    df = pd.DataFrame([data])
    df = pd.get_dummies(df)
    
    # Ensure all columns match training data
    for col in cols:
        if col not in df.columns:
            df[col] = 0
    df = df[cols]
    
    X_scaled = scaler.transform(df)
    
    prob = float(model.predict_proba(X_scaled)[0][1])  # Prob of class 1 (default)
    label = "High Risk" if prob > 0.5 else "Low Risk"
    
    # Realistic risk factors extraction
    factors = []
    
    income = data.get('person_income', 1)
    loan_amnt = data.get('loan_amnt', 0)
    emp_length = data.get('person_emp_length', 10)
    int_rate = data.get('loan_int_rate', 10)
    age = data.get('person_age', 30)
    cred_hist = data.get('cb_person_cred_hist_length', 5)
    home_owner = data.get('person_home_ownership', 'RENT')

    # Factor 1: Debt to Income mapping
    if loan_amnt >= (income * 0.40):
        factors.append("Critical: Loan amount is 40% or more of annual income, indicating a very high financial burden.")
    elif loan_amnt >= (income * 0.20):
        factors.append("Warning: Loan amount is 20% or more of annual income, representing significant leverage.")

    # Factor 2: Employment stability
    if emp_length < 2:
        factors.append("High Risk: Short employment history (less than 2 years) implies potential income instability.")
    elif emp_length < 4:
        factors.append("Notice: Limited employment history (under 4 years) may affect long-term repayment confidence.")

    # Factor 3: Interest rate reflection
    if int_rate > 14:
        factors.append("High Risk: A high interest rate assigned to this loan correlates with higher historical default probability.")
    elif int_rate > 9:
        factors.append("Notice: Moderate interest rate assigned, reflecting a non-prime risk category.")

    # Factor 4: Age & Credit History synergy
    if cred_hist < 5:
        factors.append("Warning: Relatively short credit history (under 5 years) for a comprehensive risk profile.")
    if age < 25 and loan_amnt > 10000:
        factors.append("High Risk: Large loan request for a young applicant, increasing statistical risk exposure.")

    # Factor 5: Collateral & Ownership
    if home_owner in ['RENT', 'OTHER'] and loan_amnt > 5000:
        factors.append("Notice: Applicant is renting while requesting a significant loan, indicating a lack of immovable collateral.")

    # Ensure we return at most 5 biggest factors (we'll just slice the top 5 to be safe)
    factors = factors[:5]

    if not factors:
        if prob > 0.5:
            factors.append("Notice: AI model detected risk patterns in the combined applicant profile that exceed standard safety thresholds.")
        else:
            factors.append("Satisfactory: Risk levels are within normal financial parameters and present no major flags.")
        
    return {
        "probability": round(prob * 100, 2),
        "label": label,
        "factors": factors
    }
