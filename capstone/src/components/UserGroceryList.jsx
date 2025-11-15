import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GroceryItemForm from './GroceryItemForm.jsx';
import { Link } from 'react-router-dom';
import '../App.css';

const UserGroceryList = () => {
    const [listItems, setListItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshToggle, setRefreshToggle] = useState(false);
    
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingQuantity, setEditingQuantity] = useState(0);

    const token = localStorage.getItem('access_token');


    const handleNewItemAdded = () => {
        setRefreshToggle((prev) => !prev);
    };  

    const fetchList = useCallback (async () => {
        setLoading(true);
        setError(null);
        try {
            
            if (!token) {
                throw new Error("No access token found.");
            }
            const response = await axios.get('http://localhost:5000/api/list/items', 
                { headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setListItems(Array.isArray(response.data) ? response.data : []);
            
        } catch (err) {
            console.error("Error fetching grocery list:", err);
            setError("Failed to load grocery list. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [token]); 

    const startEdit = (item) => {
        setEditingItemId(item.id);
        setEditingQuantity(item.quantity);
    };

    const handleUpdateQuantity = async (itemId) => {
        setError(null);
        if (editingQuantity < 1) {
            setError('Quantity must be 1 or more.');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/list/${itemId}`, 
                { quantity: editingQuantity },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            setListItems(prevList => 
                prevList.map(item => 
                    item.id === itemId ? { ...item, quantity: editingQuantity } : item
                )
            );
            
            setEditingItemId(null);
            
        } catch (err) {
            console.error("Error updating item:", err);
            setError(err.response?.data?.msg || 'Failed to update quantity.');
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }
        setError(null);
        try {
            if (!token) { setError('You must be logged in to delete items.'); return; }

            await axios.delete(`http://localhost:5000/api/list/${itemId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setListItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete item.');
        }
    };

    useEffect(() => {
        fetchList();
    }, [refreshToggle, fetchList]);

    const recentItems = listItems
        .slice()
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);
        
    
    const renderListItem = (item) => {
        const isEditing = item.id === editingItemId;
        
        return (
            <li key={item.id} className="grocery-card">
                
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
                        
                        {item.brands && (
                            <span className="card-brands">
                                {item.brands}
                            </span>
                        )}
                    </div>
                    
                    <div className="card-actions">
                        {isEditing ? (
                            <>
                                <span>Qty:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={editingQuantity}
                                    onChange={(e) => setEditingQuantity(parseInt(e.target.value) || 1)}
                                    className="card-quantity-input"
                                />
                                <button onClick={() => handleUpdateQuantity(item.id)}>Save</button>
                                <button onClick={() => setEditingItemId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <span className="card-quantity-display">x{item.quantity}</span>
                                <button onClick={() => startEdit(item)}>Edit</button>
                                <button onClick={() => handleDelete(item.id)} className="btn-delete">Delete</button>
                            </>
                        )}
                    </div>
                </div>
            </li>
        );
    };

    if (loading && listItems.length === 0) return <div> Loading your items...</div>;
    if (error && listItems.length === 0) return ( <div className="user-list-container">
        <h3>Recent Items</h3>
        <GroceryItemForm onItemAdded={handleNewItemAdded}/>
        <div style={{ color: 'yellow' }}>{error}</div>
        </div>
    );

    return (
        <div className="user-list-container">
            <h1>Welcome to NutriView</h1>
            <h2>Your first step towards a healthier you!</h2>
            <GroceryItemForm onItemAdded={handleNewItemAdded} />
            <h4 className='recent'>Recent Items</h4> 
            
            {recentItems.length > 0 ? (
                <ul className="grocery-list">
                    {recentItems.map(renderListItem)} 
                </ul>
            ) : (
                <p>Your grocery list is empty. Start your search!</p>
            )}

            {listItems.length > recentItems.length && (
                <p style={{ marginTop: '15px'}}>
                    <Link to="/all-items">View all {listItems.length} items...</Link>
                </p>
            )}
        </div>
    );
}

export default UserGroceryList;