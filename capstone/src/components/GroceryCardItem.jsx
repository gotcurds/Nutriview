import React from 'react';

const GroceryCardItem = ({
    item, 
    isEditing, 
    editedQuantity, 
    setEditedQuantity, 
    startEdit, 
    handleUpdateQuantity, 
    handleDelete, 
    setEditingItemId
}) => {
    const renderDetailBlock = (title, content, className) => {
        if (!content) return null;

        const displayContent = title === 'Ingredients' && content.length > 800 ? `${content.substring(0, 800)}...` : content;

        return ( <div className={`card-detail-block ${className || ''}`}>
            <p><strong>{title}:</strong> {displayContent}</p>
        </div> );
    };
    return ( <li key={item.id} className="grocery-card">
            <div className="card-header">
                {item.thumb_url && (
                    <img
                        src={item.thumb_url}
                        alt={item.product_name}
                        className="card-img"
                    />
                )}
                <div className="card-title-section">
                    <strong className="card-product-name">{item.product_name}</strong>
                    {item.brands && (<span className="card-brands">{item.brands}</span>)}
                </div>

                <div className="card-actions">
                    {isEditing ? (
                        <>
                            <span>Qty:</span>
                            <input
                                type="number"
                                min="1"
                                value={editedQuantity}
                                onChange={(e) => setEditedQuantity(parseInt(e.target.value) || 1)}
                                className="card-quantity-input"
                            />
                            <button onClick={() => handleUpdateQuantity(item.id)} className="btn-save">Save</button>
                            <button onClick={() => setEditingItemId(null)} className="btn-cancel">Cancel</button>
                        </>
                    ) : (
                        <>
                            <span className="card-quantity-display">x{item.quantity}</span>
                            <button onClick={() => startEdit(item)} className="btn-edit">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="btn-delete">Delete</button>
                        </>
                    )}
                </div>
            </div>
            
            
            <div className="card-details">
                {item.serving_size && <p><strong>Serving Size:</strong> {item.serving_size}</p>}
                
                
                {(item.calories || item.protein || item.fat || item.carbohydrates) && (
                    <div className="card-nutrition">
                        <strong>Nutrition Breakdown:</strong>
                        <span className="card-nutrition-item"> Calories (per serving): {item.calories || 'N/A'}</span>
                        <span className="card-nutrition-item">Protein (per 100g): {item.protein || 'N/A'}</span>
                        <span className="card-nutrition-item">Fat (per 100g): {item.fat || 'N/A'}</span>
                        <span className="card-nutrition-item">Carbs (per 100g): {item.carbohydrates || 'N/A'}</span>
                        <span className="card-nutrition-item">Saturated Fat (per 100g): {item.saturated_fat || 'N/A'}</span>
                        <span className="card-nutrition-item">Sugars (per 100g): {item.sugars || 'N/A'}</span>
                        <span className="card-nutrition-item">Salt (per 100g): {item.salt || 'N/A'}</span>
                    </div>
                )}
                
                
                {renderDetailBlock('Labels', item.labels, 'card-labels')}
                {renderDetailBlock('Category', item.categories, 'card-category')}
                {renderDetailBlock('Ingredients', item.ingredients, 'card-ingredients')}
                {item.allergens && (
                    <div className="card-detail-block card-allergens-block">
                        <p className="card-allergens"><strong>Allergens:</strong> {item.allergens}</p>
                    </div>
                )}
            </div>
        </li>
    );
};

export default GroceryCardItem;