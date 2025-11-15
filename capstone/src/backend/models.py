from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from sqlalchemy.sql import func

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(225), nullable=False)

    grocery_items = db.relationship('GroceryItem', backref='owner')

class GroceryItem(db.Model):
    __tablename__ = 'grocery_items'
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(255), nullable=False)
    date_added = db.Column(db.DateTime, default=func.current_timestamp())
    quantity = db.Column(db.Integer, default=1, nullable=False)
    brands = db.Column(db.String(255), nullable=True)
    thumb_url = db.Column(db.String(500), nullable=True)
    ingredients = db.Column(db.Text, nullable=True)
    allergens = db.Column(db.String(500), nullable=True)
    labels = db.Column(db.String(500), nullable=True)
    serving_size = db.Column(db.String(255), nullable=True)
    categories = db.Column(db.String(500), nullable=True)
    fat = db.Column(db.String(255), nullable=True)
    saturated_fat = db.Column(db.String(255), nullable=True)
    carbohydrates = db.Column(db.String(255), nullable=True)
    sugars = db.Column(db.String(255), nullable=True)
    protein = db.Column(db.String(255), nullable=True)
    salt = db.Column(db.String(255), nullable=True)
    calories = db.Column(db.String(50), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return { 
            "id": self.id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "brands": self.brands,
            "thumb_url": self.thumb_url,
            "ingredients": self.ingredients,
            "allergens": self.allergens,
            "labels": self.labels,
            "serving_size": self.serving_size,
            "categories": self.categories,
            "fat": self.fat,
            "saturated_fat": self.saturated_fat,
            "carbohydrates": self.carbohydrates,
            "sugars": self.sugars,
            "protein": self.protein,
            "salt": self.salt,
            'calories': self.calories
        }