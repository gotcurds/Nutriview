from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import timedelta
import os



from list_routes import list_bp
from models import db, GroceryItem, User, bcrypt,jwt
from auth_routes import auth_bp



def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback-dev-secret")
    app.config["JWT_COOKIE_SECURE"] = False
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///dev.db')
    app.config['SQLALCHEMY_TRACK_MODIFCATIONS'] = False

    @jwt.user_identity_loader
    def user_identity_lookup(user_id):
        return str(user_id)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)


    app.register_blueprint(list_bp)
    app.register_blueprint(auth_bp)

    from flask_jwt_extended.exceptions import NoAuthorizationError

    @app.errorhandler(NoAuthorizationError)
    def handle_auth_error(e):
        return jsonify(msg="Missing or invalid Authorization Header"), 401
    
    @app.errorhandler(422)
    def handle_unprocessable_entity(err):
        exc = getattr(err, 'exc')
        if exc:
            return jsonify(message=exc.messages), 422
        return jsonify(message="Unprocessable Entity"), 422

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"msg": "Flask backend is running successfully!"})
    

    return app



app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # print("Dropping all current tables...")
        # db.drop_all()
    
    app.run()