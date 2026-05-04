# 🏦 AI-Based Credit Risk & Loan Default Prediction API

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-black?style=for-the-badge&logo=flask)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.x-orange?style=for-the-badge&logo=scikit-learn)
![XGBoost](https://img.shields.io/badge/XGBoost-latest-red?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite)
![JWT](https://img.shields.io/badge/JWT-Auth-purple?style=for-the-badge)

> A production-ready REST API that predicts loan default risk using an ensemble of machine learning models — Logistic Regression, Random Forest, and XGBoost — with role-based authentication, persistent report history, and interpretable risk factor extraction.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [API Endpoints](#-api-endpoints)
- [Data Schema](#-data-schema)
- [Setup & Installation](#-setup--installation)
- [Usage Guide](#-usage-guide)
- [Security](#-security)
- [Design Decisions](#-design-decisions)
- [Interview Q&A](#-interview-qa)

---

## 🎯 Project Overview

This project solves a critical real-world problem in the fintech domain: **assessing the creditworthiness of a loan applicant** before approving or rejecting their request.

### What it does

1. **Accepts** a loan applicant's profile (age, income, loan amount, employment history, etc.)
2. **Predicts** the probability that the applicant will default on the loan
3. **Classifies** applicants as `High Risk` or `Low Risk`
4. **Explains** the prediction by surfacing human-readable risk factors
5. **Persists** every prediction report to a database for audit and history

### Who uses it

| Role | Capabilities |
|------|-------------|
| **User** | Sign up, log in, submit predictions, view personal prediction history |
| **Admin** | All user capabilities + upload datasets + trigger model retraining |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Frontend / Postman)        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP Requests (JSON)
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Flask REST API                    │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  /api/auth  │  │  /api/admin  │  │/api/predict│ │
│  │  (signup,   │  │  (upload,    │  │ (predict,  │  │
│  │   login)    │  │   train)     │  │  history)  │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                │                │         │
│  ┌──────▼────────────────▼────────────────▼──────┐  │
│  │              JWT Middleware (Auth Guard)        │  │
│  └──────────────────────┬────────────────────────┘  │
│                         │                            │
│  ┌──────────────────────▼────────────────────────┐  │
│  │                  ML Service                    │  │
│  │  ┌────────────┐ ┌─────────────┐ ┌──────────┐  │  │
│  │  │  Logistic  │ │   Random    │ │ XGBoost  │  │  │
│  │  │ Regression │ │   Forest    │ │  Model   │  │  │
│  │  └────────────┘ └─────────────┘ └──────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                         │                            │
│  ┌──────────────────────▼────────────────────────┐  │
│  │              SQLite Database (SQLAlchemy ORM)  │  │
│  │        Users Table  │  Reports Table           │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
Client → POST /api/predict/
       → JWT Verified
       → Input Validated
       → Features Preprocessed (get_dummies + StandardScaler)
       → XGBoost Inference → Probability Score
       → Risk Factors Extracted via Rule Engine
       → Report Saved to DB
       → JSON Response Returned
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web Framework** | Flask | Lightweight REST API server |
| **ORM** | Flask-SQLAlchemy | Database abstraction over SQLite |
| **Authentication** | Flask-JWT-Extended | Stateless JWT-based auth |
| **Password Security** | Flask-Bcrypt | Password hashing (bcrypt algorithm) |
| **CORS** | Flask-CORS | Cross-Origin Resource Sharing |
| **ML — Linear** | scikit-learn LogisticRegression | Baseline classification model |
| **ML — Ensemble** | scikit-learn RandomForestClassifier | Non-linear ensemble model |
| **ML — Boosting** | XGBoost XGBClassifier | Primary inference model |
| **Preprocessing** | scikit-learn StandardScaler | Feature normalization |
| **Model Serialization** | joblib | Save/load trained model artifacts |
| **Data Processing** | pandas | CSV ingestion and feature engineering |
| **Database** | SQLite | Embedded relational DB for dev/prod |
| **Production Server** | Gunicorn | WSGI server for deployment |

---

## 📁 Project Structure

```
backend/
│
├── app.py                    # Application factory, blueprint registration
├── extensions.py             # Shared extension instances (db, bcrypt, jwt, cors)
├── models.py                 # SQLAlchemy ORM models (User, Report)
├── requirements.txt          # Python dependencies
│
├── routes/
│   ├── auth_routes.py        # POST /signup, POST /login
│   ├── admin_routes.py       # POST /upload, POST /train  [Admin only]
│   └── predict_routes.py     # POST /predict, GET /history
│
├── services/
│   └── ml_service.py         # ML training pipeline + inference logic
│
├── uploads/                  # Admin-uploaded CSV datasets
│   ├── dataset.csv
│   └── random_dataset.csv
│
├── ml_models/                # Serialized model artifacts (created at runtime)
│   ├── logistic_regression.pkl
│   ├── random_forest.pkl
│   ├── xgboost.pkl
│   ├── scaler.pkl            # Fitted StandardScaler
│   └── columns.pkl           # Training feature column list
│
└── app.db                    # SQLite database (created at runtime)
```

---

## 🤖 Machine Learning Pipeline

### Dataset Features

The model trains on the following input features:

| Feature | Type | Description |
|---------|------|-------------|
| `person_age` | int | Applicant age |
| `person_income` | int | Annual income (USD) |
| `person_home_ownership` | categorical | RENT / OWN / MORTGAGE / OTHER |
| `person_emp_length` | float | Years of employment |
| `loan_intent` | categorical | Purpose: EDUCATION, MEDICAL, PERSONAL, etc. |
| `loan_grade` | categorical | Credit grade: A–F |
| `loan_amnt` | int | Requested loan amount |
| `loan_int_rate` | float | Assigned interest rate |
| `loan_percent_income` | float | Loan amount as % of income |
| `cb_person_default_on_file` | categorical | Prior default on record (Y/N) |
| `cb_person_cred_hist_length` | int | Credit history length (years) |
| **`loan_status`** | binary | **Target: 1 = Default, 0 = No Default** |

### Training Pipeline (`train_models`)

```python
# 1. Load CSV
df = pd.read_csv(dataset_path)

# 2. Separate target
X = df.drop(columns=['loan_status'])
y = df['loan_status']

# 3. One-hot encode categorical features
X = pd.get_dummies(X)

# 4. Normalize numerical features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 5. Save scaler + column schema (critical for inference alignment)
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(X.columns.tolist(), 'columns.pkl')

# 6. Train/test split (80/20)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)

# 7. Train 3 models and serialize each
LogisticRegression() → logistic_regression.pkl
RandomForestClassifier(n_estimators=100) → random_forest.pkl
XGBClassifier(eval_metric='logloss') → xgboost.pkl
```

### Inference Pipeline (`predict_risk`)

```python
# 1. Load artifacts
scaler, columns, model = joblib.load(...)

# 2. Apply safe defaults for optional fields
data.setdefault('cb_person_default_on_file', 'N')
data.setdefault('loan_grade', 'B')

# 3. Encode and align columns
df = pd.get_dummies(pd.DataFrame([data]))
df = df.reindex(columns=columns, fill_value=0)

# 4. Scale
X_scaled = scaler.transform(df)

# 5. Predict (probability of class 1 = default)
prob = model.predict_proba(X_scaled)[0][1]

# 6. Classify
label = "High Risk" if prob > 0.5 else "Low Risk"

# 7. Extract rule-based risk factors
factors = extract_risk_factors(data, prob)

return { "probability": prob * 100, "label": label, "factors": factors }
```

### Risk Factor Extraction

Risk factors are extracted using a transparent **rule-based engine** layered on top of the ML score, making the prediction **explainable**:

| Rule | Trigger Condition | Factor Type |
|------|------------------|----|
| Debt-to-Income (critical) | `loan_amnt >= income * 0.40` | Critical |
| Debt-to-Income (warning) | `loan_amnt >= income * 0.20` | Warning |
| Employment instability | `emp_length < 2 years` | High Risk |
| Limited employment | `emp_length < 4 years` | Notice |
| High interest rate | `int_rate > 14%` | High Risk |
| Moderate interest rate | `int_rate > 9%` | Notice |
| Short credit history | `cred_hist < 5 years` | Warning |
| Young applicant, large loan | `age < 25 & loan > $10,000` | High Risk |
| Renter with significant loan | `RENT + loan > $5,000` | Notice |

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

---

### 🔐 Authentication

#### `POST /auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

**Response `201`:**
```json
{
  "msg": "User created successfully"
}
```

**Response `400`:**
```json
{
  "msg": "User already exists"
}
```

---

#### `POST /auth/login`
Authenticate and receive a JWT access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "role": "user",
  "email": "user@example.com"
}
```

> ⚠️ Include `Authorization: Bearer <token>` header on all protected routes.

---

### 🧠 Prediction

#### `POST /predict/`
Submit an applicant profile and receive a risk prediction.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "person_age": 28,
  "person_income": 55000,
  "person_home_ownership": "RENT",
  "person_emp_length": 3.0,
  "loan_intent": "PERSONAL",
  "loan_grade": "C",
  "loan_amnt": 12000,
  "loan_int_rate": 13.5,
  "loan_percent_income": 0.22,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 4
}
```

**Response `200`:**
```json
{
  "probability": 72.43,
  "label": "High Risk",
  "factors": [
    "Warning: Loan amount is 20% or more of annual income, representing significant leverage.",
    "Notice: Limited employment history (under 4 years) may affect long-term repayment confidence.",
    "Notice: Moderate interest rate assigned, reflecting a non-prime risk category.",
    "Warning: Relatively short credit history (under 5 years) for a comprehensive risk profile.",
    "Notice: Applicant is renting while requesting a significant loan, indicating a lack of immovable collateral."
  ]
}
```

---

#### `GET /predict/history`
Retrieve the authenticated user's full prediction history.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
[
  {
    "id": 1,
    "input_data": { "person_age": 28, "person_income": 55000, "..." : "..." },
    "score": 72.43,
    "label": "High Risk",
    "date": "2024-11-15T10:32:00"
  }
]
```

---

### 🛡️ Admin

#### `POST /admin/upload`
Upload a training dataset CSV. **Admin only.**

**Headers:** `Authorization: Bearer <admin-token>`

**Form Data:**
```
file: <CSV file with loan_status column>
```

**Response `200`:**
```json
{
  "msg": "File uploaded successfully",
  "filename": "dataset.csv"
}
```

---

#### `POST /admin/train`
Trigger model retraining on a previously uploaded dataset. **Admin only.**

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "filename": "dataset.csv"
}
```

**Response `200`:**
```json
{
  "msg": "Model trained successfully",
  "results": {
    "Logistic Regression": 0.8734,
    "Random Forest": 0.9102,
    "XGBoost": 0.9215
  }
}
```

---

## 🗄️ Data Schema

### `users` Table

| Column | Type | Constraints |
|--------|------|------------|
| `id` | Integer | Primary Key, Auto-increment |
| `email` | String(120) | Unique, Not Null |
| `password_hash` | String(128) | bcrypt hash |
| `role` | String(20) | Default: `'user'` |
| `created_at` | DateTime | Default: UTC now |

### `reports` Table

| Column | Type | Constraints |
|--------|------|------------|
| `id` | Integer | Primary Key, Auto-increment |
| `user_id` | Integer | Foreign Key → `users.id` |
| `input_data` | Text | JSON string of input features |
| `prediction_score` | Float | Probability (0–100) |
| `prediction_label` | String(100) | "High Risk" / "Low Risk" |
| `risk_factors` | Text | JSON array of factor strings |
| `created_at` | DateTime | Default: UTC now |

---

## 🚀 Setup & Installation

### Prerequisites

- Python 3.10+
- pip

### 1. Clone the repository

```bash
git clone https://github.com/your-username/credit-risk-api.git
cd credit-risk-api/backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the development server

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

The SQLite database (`app.db`) and all tables are auto-created on first run.

### 5. (Optional) Train the model immediately

```bash
# 1. Register an admin account
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass123","role":"admin"}'

# 2. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass123"}'

# 3. Upload dataset
curl -X POST http://localhost:5000/api/admin/upload \
  -H "Authorization: Bearer <your_token>" \
  -F "file=@uploads/dataset.csv"

# 4. Trigger training
curl -X POST http://localhost:5000/api/admin/train \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"filename":"dataset.csv"}'
```

### 6. Production deployment with Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

---

## 🔒 Security

### Authentication Flow

```
User submits email + password
    ↓
Server verifies password against bcrypt hash
    ↓
Server issues JWT with claims: { user_id, role, email }
    ↓
Client stores token and sends via Authorization: Bearer header
    ↓
Flask-JWT-Extended validates token on every protected route
    ↓
Admin routes additionally verify role == 'admin' from JWT claims
```

### Security Layers

| Concern | Implementation |
|---------|---------------|
| Password Storage | bcrypt hashing (one-way, salted) via Flask-Bcrypt |
| Session Management | Stateless JWT tokens (no server-side sessions) |
| Role Enforcement | JWT claims checked inline per admin route |
| CORS | Restricted to `/api/*` prefix via Flask-CORS |
| Token Identity | User ID stored as string; cast to int before DB queries |

### ⚠️ Production Checklist

- [ ] Replace `JWT_SECRET_KEY` with a strong, randomly generated secret
- [ ] Switch from SQLite to PostgreSQL or MySQL
- [ ] Add token expiry (`JWT_ACCESS_TOKEN_EXPIRES`)
- [ ] Add refresh token mechanism
- [ ] Move secrets to environment variables (`.env` + `python-dotenv`)
- [ ] Enforce HTTPS in production
- [ ] Add rate limiting to prevent brute-force attacks

---

## 🧩 Design Decisions

### Why Flask over Django?
Flask is lightweight and gives full control over the structure. For an API-only backend with a small, well-defined scope, Flask avoids Django's overhead and keeps the codebase lean and interview-friendly.

### Why the Application Factory Pattern?
`create_app()` in `app.py` enables proper testing (each test can create a fresh app instance), avoids circular imports, and is the Flask best practice for production apps.

### Why SQLite?
SQLite requires zero configuration, is file-based, and is perfect for development and small-scale deployments. SQLAlchemy abstracts the database, so switching to PostgreSQL in production requires only changing the `SQLALCHEMY_DATABASE_URI` config string.

### Why XGBoost as the primary inference model?
XGBoost consistently outperforms Logistic Regression and often matches or exceeds Random Forest in tabular data tasks. It's also the industry standard for credit scoring. The test output in `test_out.txt` confirms it produces calibrated probabilities.

### Why rule-based risk factors instead of SHAP?
SHAP explainability requires the model to run additional computation per inference. The rule-based approach is deterministic, fast, auditable, and produces business-friendly language that a loan officer can act on — which is more valuable than raw feature importance weights.

### Why `pd.get_dummies` + column alignment?
One-hot encoding via `pd.get_dummies` is simple and stateless. The key insight is saving the **exact column list** from training (`columns.pkl`) and reindexing inference data to match it. This handles missing or unseen categories gracefully by filling with `0`.

### Why `joblib` over `pickle`?
`joblib` is optimized for large NumPy arrays (which are embedded in sklearn/XGBoost models) and is the recommended serialization method by scikit-learn itself.

---

## 💡 Interview Q&A

**Q: How does the model handle a categorical feature it hasn't seen during training (e.g., a new loan_intent value)?**

A: `pd.get_dummies` on the inference input will create a column for the unknown category. The `df.reindex(columns=cols, fill_value=0)` step then drops that column and fills the original training columns with zeros. The model essentially sees a missing/unknown category as a zero across all related one-hot columns, which is a reasonable and safe fallback.

---

**Q: How is role-based access control implemented?**

A: Roles are embedded as additional claims in the JWT at login time (`additional_claims={'role': user.role}`). Admin routes extract this via `get_jwt()` and check `if current_user.get('role') != 'admin'`. This is stateless — no database lookup needed per request.

---

**Q: What would you change to scale this to millions of users?**

A: Switch the DB to PostgreSQL with connection pooling (PgBouncer). Move model inference to an async task queue (Celery + Redis) to avoid blocking web workers. Cache model artifacts in memory at startup instead of loading from disk per request. Add a CDN or object storage (S3) for dataset and model artifact storage. Containerize with Docker and orchestrate with Kubernetes.

---

**Q: How would you prevent model drift over time?**

A: Implement a scheduled retraining pipeline (e.g., Airflow DAG or cron job) that ingests new labelled loan outcomes periodically. Track model performance metrics (AUC-ROC, precision, recall) over time and trigger alerts when they drop below a threshold. Store model versions with timestamps and support rollback.

---

**Q: Why store `input_data` as a JSON string in the reports table instead of separate columns?**

A: It provides flexibility — if the feature set changes (new columns added), old reports remain intact without DB migrations. The trade-off is that you lose the ability to query by individual feature values efficiently. For analytics at scale, a columnar store like Redshift or a data warehouse would be more appropriate.

---

## 📊 Sample Prediction Walkthrough

**Input:** 32-year-old with $600K income, owns home, 5 years employed, $25K loan at 2% interest, grade A, 8 years credit history.

**Test output (from `test_out.txt`):**
- Probability of default: **81.9%** → `High Risk`

**Why?** Despite the high income, the model detects patterns in the combined feature vector — particularly the unusual interest rate (2%, far below market) combined with the specific loan structure — that correlate with high-risk profiles in the training data. This demonstrates XGBoost's ability to detect non-linear interactions that simpler models might miss.

---

## 🙏 Acknowledgements

- [Kaggle Credit Risk Dataset](https://www.kaggle.com/datasets/laotse/credit-risk-dataset) — Inspired the feature schema used in this project
- [Flask Documentation](https://flask.palletsprojects.com/)
- [scikit-learn Documentation](https://scikit-learn.org/)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
