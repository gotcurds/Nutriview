import requests
from flask import jsonify, Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, GroceryItem, User

list_bp = Blueprint('list_routes', __name__, url_prefix='/api/list')

@list_bp.route('/items', methods=['POST'])
@jwt_required()
def add_item():
    user_id = get_jwt_identity()
   
    try:
        data = request.get_json()
        product_name = data.get('product_name')
        try:
            quantity = int(data.get('quantity', 1))
        except ValueError:
            quantity = 1 
        brands = data.get('brands')
        thumb_url = data.get('thumb_url')
        
        if not product_name:
            return jsonify({"msg": "Missing product name"}), 400
        
        ingredients = data.get('ingredients')
        allergens = data.get('allergens')
        labels = data.get('labels')
        serving_size = data.get('serving_size')
        categories = data.get('categories')
        calories = data.get('calories')
        fat = data.get('fat')
        saturated_fat = data.get('saturated_fat')
        carbohydrates = data.get('carbohydrates')
        sugars = data.get('sugars')
        protein = data.get('protein')
        salt = data.get('salt')
        
        product_name = product_name.strip()
        item_exists = GroceryItem.query.filter_by(user_id=user_id, product_name=product_name).first()
        if item_exists: 
            
            item_exists.quantity += quantity
            item_exists.brands = brands
            item_exists.thumb_url = thumb_url
            item_exists.ingredients = ingredients
            item_exists.allergens = allergens
            item_exists.labels = labels
            item_exists.serving_size = serving_size
            item_exists.categories = categories
            item_exists.calories = calories
            item_exists.fat = fat
            item_exists.saturated_fat = saturated_fat
            item_exists.carbohydrates = carbohydrates
            item_exists.sugars = sugars
            item_exists.protein = protein
            item_exists.salt = salt
            
            db.session.commit()
            return jsonify(item_exists.to_dict()), 200
        else:
            
            new_item = GroceryItem(
                user_id=user_id,
                product_name=product_name,
                quantity=quantity,
                brands=brands,
                thumb_url=thumb_url,
                ingredients=ingredients,
                allergens=allergens,
                labels=labels,
                serving_size=serving_size,
                categories=categories,
                calories=calories,
                fat=fat,
                saturated_fat=saturated_fat,
                carbohydrates=carbohydrates,
                sugars=sugars,
                protein=protein,
                salt=salt
            )
            db.session.add(new_item)
            db.session.commit()
            return jsonify(new_item.to_dict()), 201           
    
    except Exception as e:
        db.session.rollback()
        print(f"Error adding item: {e}")
        return jsonify({"msg": "Could not add item", "error": str(e)}), 500
    



@list_bp.route('/search', methods=['GET'])
@jwt_required()
def search_food():
    search_term = request.args.get('q')

    if not search_term:
        return jsonify({"msg": "Missing search query 'q'"}), 400
    
    url = f"https://world.openfoodfacts.org/cgi/search.pl?action=process&search_terms={search_term}&json=1"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        products_list = data.get('products', [])

        processed_products = []
        for product in products_list:

            processed_products.append({
                'code': product.get('code'),
                'nutriments': product.get('nutriments', {}),
                'product_name': product.get('product_name_en') or product.get('product_name', None),
                'generic_name': product.get('generic_name_en') or product.get('generic_name', None),
                'brands_tags': product.get('brands_tags', []),
                'image_thumb_url': product.get('image_thumb_url'),
                'ingredients_text_en': product.get('ingredients_text_en'),
                'ingredients_text': product.get('ingredients_text'),
                'allergens_tags': product.get('allergens_tags'),
                'labels_tags': product.get('labels_tags'),
                'categories_tags': product.get('categories_tags'),
                'serving_size': product.get('serving_size')
        })
        return jsonify({"products": processed_products}), 200
    except requests.expections.HTTPError as err:
        return jsonify({"msg": f"External API HTTP error: {err}", "status": response.status_code}), response.status_code
    except requests.exceptions.RequestException as err:
        return jsonify({"msg": f"External API connection error: {err}"}), 503
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"msg": "An unexpected server error occurred."}), 500

@list_bp.route('/items', methods=['OPTIONS'])
def handle_options():
    return '', 200   

@list_bp.route('/items', methods=['GET'])
@jwt_required()
def get_inventory_list():
    
    user_id = get_jwt_identity()

    if request.method == "GET":
        try:
            user_items = GroceryItem.query.filter_by(user_id=user_id).all()
            items_data = [item.to_dict() for item in user_items]
            
            return jsonify (items_data), 200
        except Exception as e:
            return jsonify({"msg": "Failed to retrieve list items", "error": str(e)}), 500
    return jsonify({"msg": "Method not allowed"}), 405

@list_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required(optional=True)
def update_item_quantity(item_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user_id = get_jwt_identity()
    if user_id is None:
        return jsonify({"msg": "Authorization required."}), 401
    
    data = request.get_json()
    new_quantity = data.get('quantity')

    if new_quantity is None:
        return jsonify({"msg": "Missing new quantity"}), 400
    
    try:
        item = GroceryItem.query.filter_by(id=item_id, user_id=user_id).first()
        if not item:
            return jsonify({"msg": "Item not found or access denied"}), 404
        item.quantity = int(new_quantity)
        db.session.commit()
        return jsonify({"msg": "Item updated successfully"}), 200
    
    except ValueError:
        db.session.rollback()
        return jsonify({"msg": "Quantity must be a valid interger"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Database error during update", "error": str(e)}), 500


@list_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required(optional=True)
def delete_item(item_id):

    if request.method == 'OPTIONS':
        return '', 200
    user_id = get_jwt_identity()
    if user_id is None:
        return jsonify({"msg": "Authorization token is missing or invalid."}), 401
    try:
        item = GroceryItem.query.filter_by(id=item_id, user_id=user_id).first()

        if not item:
            return jsonify({"msg": "Item not found or access denied"}), 404
    
        db.session.delete(item)
        db.session.commit()
        return jsonify({"msg": "Item deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Database error during deletion", "error": str(e)}), 500