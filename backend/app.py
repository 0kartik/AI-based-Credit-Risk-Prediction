import os
from flask import Flask
from extensions import db, bcrypt, jwt, cors

from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.predict_routes import predict_bp

def create_app():
    app = Flask(__name__)
    
    # Configuration
    base_dir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(base_dir, 'app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'dev-super-secret-key' # Change in production
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    
    @app.route('/')
    def index():
        return {"message": "AI-Based Credit Risk & Loan Default Prediction API is running"}
    
    # Create tables
    with app.app_context():
        import models
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
