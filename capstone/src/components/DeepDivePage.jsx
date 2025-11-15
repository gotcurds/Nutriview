import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import GroceryCardItem from './GroceryCardItem'; 
import '../App.css';


const API_BASE_URL = 'http://localhost:5000/api/list';


const DeepDivePage = () => {
    
    const [inventoryList, setInventoryList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    
    const [editingItemId, setEditingItemId] = useState(null);
    const [editedQuantity, setEditedQuantity] = useState(0);

    
    const accessToken = localStorage.getItem('access_token');

    
    const fetchFullList = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
           
            if (!accessToken) throw new Error("Authentication error: No access token found.");
            
           
            const response = await axios.get(`${API_BASE_URL}/items`, 
                
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );
            
            
            const sortedItems = response.data.sort((a, b) => b.id - a.id); 
            setInventoryList(sortedItems);
        } catch (err) {
            console.error("Error fetching inventory list:", err);
            
            setError(err.response?.data?.msg || "Failed to load inventory list. Please sign in again.");
        } finally {
            setLoading(false);
        }
    }, [accessToken]); 

    
    const startEdit = (item) => {
        setEditingItemId(item.id);
        setEditedQuantity(item.quantity);
    };

    
    const handleUpdateQuantity = async (itemId) => {
        if (editedQuantity < 1 || isNaN(editedQuantity)) {
            setError('Quantity must be 1 or more.');
            return;
        }
        setError(null);

        try {
            await axios.put(`${API_BASE_URL}/${itemId}`, 
                { quantity: editedQuantity },
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );
            
            
            setInventoryList(prevList => 
                prevList.map(item => 
                    item.id === itemId ? { ...item, quantity: editedQuantity } : item
                )
            );
            
            setEditingItemId(null);
            
        } catch (err) {
            console.error("Error updating item:", err);
            setError(err.response?.data?.msg || 'Failed to update quantity.');
        }
    };
    
    
    const handleDelete = async (itemId) => {
        setError(null);
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/${itemId}`, { 
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            
            setInventoryList(inventoryList.filter(item => item.id !== itemId));
            
        } catch (err) {
            console.error("Error deleting item:", err);
            setError(err.response?.data?.msg || 'Failed to delete item.');
        }
    };

    
    const filteredList = inventoryList.filter(item => {
        const term = searchTerm.toLowerCase();
        const nameMatch = item.product_name.toLowerCase().includes(term);
        const brandsMatch = item.brands && item.brands.toLowerCase().includes(term);
        return nameMatch || brandsMatch;
    });

    
    useEffect(() => {
        fetchFullList();
    }, [fetchFullList]);

    
    if (loading) return <div>Loading your inventory...</div>;
    if (error) return <div style={{ color: 'var(--danger-color)', padding: '10px' }}>Error: {error}</div>;

    return (
        <div className="all-items-container">
            
            <h1 className="user-list-container">Deep Dive: Nutritional Analysis</h1>
            <h2 className="user-list-container">The comprehensive nutrient profile of your entire item history.</h2>
            <h3>🛒 All Items ({filteredList.length} of {inventoryList.length})</h3>
            
            
            <input
                type="text"
                placeholder="Filter list by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input" 
            />
           
            {error && <p style={{ color: 'var(--danger-color)', marginBottom: '10px' }}>{error}</p>}

            <p>This is your complete list, sorted newest first.</p>

           
            {filteredList.length === 0 ? (
                <p>
                    {inventoryList.length > 0 && searchTerm ? `No items match "${searchTerm}".` : 'Your grocery list is empty. Start adding items!'}
                </p>
            ) : (
                <ul className="grocery-list">
                    {filteredList.map(item => {
                        const isEditing = item.id === editingItemId;
                        return (
                            <GroceryCardItem 
                                key={item.id} 
                                item={item}
                                isEditing={isEditing}
                                editedQuantity={editedQuantity}
                                setEditedQuantity={setEditedQuantity}
                                startEdit={startEdit}
                                handleUpdateQuantity={handleUpdateQuantity}
                                handleDelete={handleDelete}
                                setEditingItemId={setEditingItemId}
                            />
                        );
                    })}
                </ul>
            )}
             <p style={{ marginTop: '20px' }}>
                
                <Link to="/discover">← Back to Discovering Products</Link>
            </p>
        </div>
    );
}

export default DeepDivePage;