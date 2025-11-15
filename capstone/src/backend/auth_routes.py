from flask import Blueprint, request, jsonify
from models import db, User, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


auth_bp = Blueprint('auth-routes', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    plaintext_password = data.get('password')

    if not email or not plaintext_password:
        return jsonify({"msg": "Email and password required"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 409
    
    hashed_password = bcrypt.generate_password_hash(plaintext_password).decode('utf-8')

    new_user = User(email=email, password=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=str(new_user.id))

        return jsonify({"msg": "User created successfully and logged in", "user_id": new_user.id, "access_token": access_token}), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Error during registration: {e}")
        return jsonify({"msg": "Registration failed", "error": str(e)}), 500
    
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    plaintext_password = data.get('password')

    if not email or not plaintext_password:
        return jsonify({"msg": "Email and password required"}), 400
    
    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, plaintext_password):

        access_token = create_access_token(identity=str(user.id))

        return jsonify({"msg": "Login successful", "user_id": user.id, "access_token": access_token}), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401
