from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ml_service import predict_risk
import json
from models import Report
from extensions import db

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/', methods=['POST'])
@jwt_required()
def generate_prediction():
    user_id = get_jwt_identity()  # Returns string user_id
    data = request.get_json()
    
    if not data:
        return jsonify({"msg": "No input data provided"}), 400
        
    try:
        # Call the ml_service to get the inference
        prediction_result = predict_risk(data)
        
        # Save to database (convert user_id to int as DB expects integer)
        report = Report(
            user_id=int(user_id),
            input_data=json.dumps(data),
            prediction_score=prediction_result['probability'],
            prediction_label=prediction_result['label'],
            risk_factors=json.dumps(prediction_result['factors'])
        )
        db.session.add(report)
        db.session.commit()
        
        return jsonify(prediction_result), 200
    except Exception as e:
        return jsonify({"msg": f"Prediction failed: {str(e)}"}), 500
        
@predict_bp.route('/history', methods=['GET'])
@jwt_required()
def get_user_history():
    user_id = get_jwt_identity()  # Returns string user_id
    reports = Report.query.filter_by(user_id=int(user_id)).order_by(Report.created_at.desc()).all()
    
    results = []
    for r in reports:
        results.append({
            "id": r.id,
            "input_data": json.loads(r.input_data),
            "score": r.prediction_score,
            "label": r.prediction_label,
            "date": r.created_at.isoformat()
        })
    return jsonify(results), 200