from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
import os
from services.ml_service import train_models

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_dataset():
    current_user = get_jwt()
    if current_user.get('role') != 'admin':
        return jsonify({"msg": "Unauthorized. Admin only."}), 403
        
    if 'file' not in request.files:
        return jsonify({"msg": "No file included"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No file selected"}), 400
        
    # Ensure uploads dir exists
    uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    filepath = os.path.join(uploads_dir, file.filename)
    file.save(filepath)
    
    return jsonify({"msg": "File uploaded successfully", "filename": file.filename}), 200

@admin_bp.route('/train', methods=['POST'])
@jwt_required()
def trigger_training():
    current_user = get_jwt()
    if current_user.get('role') != 'admin':
        return jsonify({"msg": "Unauthorized. Admin only."}), 403
        
    data = request.get_json() or {}
    filename = data.get('filename', 'dataset.csv')
    filepath = os.path.join(os.path.dirname(__file__), '..', 'uploads', filename)
    
    if not os.path.exists(filepath):
        return jsonify({"msg": f"File {filename} not found. Upload it first."}), 404
        
    try:
        # Trigger ML pipeline dynamically
        results = train_models(filepath)
        return jsonify({"msg": "Model trained successfully", "results": results}), 200
    except Exception as e:
        return jsonify({"msg": f"Training failed: {str(e)}"}), 500
