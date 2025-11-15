import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const debounce = (func, delay) => {
    let timeoutId;
    const debounced = (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
    debounced.cancel = () => clearTimeout(timeoutId);
    return debounced;
};

const GroceryItemForm = ({ onItemAdded }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const token = localStorage.getItem('access_token');
    
    const getNutrientValue = (product, key, perServing = false) => {
    const unitKey = `${key}_unit`;
    const servingValueKey = `${key}_serving`;
    const hundredGValueKey = `${key}_100g`;

    const nutriments = product?.nutriments;
    if (!nutriments) return null;

    let value = null;
    
   
    if (perServing) {
        value = nutriments[servingValueKey];
    }
    
    
    if (value === undefined || value === null) {
        value = nutriments[hundredGValueKey];
    }

    
    if (value === undefined || value === null) return null;

    
    let unit = nutriments[unitKey];

    
    if (key.startsWith('energy') && !unit) {
        unit = 'kcal';
    } else if (!unit) {
        unit = 'g'; 
    }
    
    
    return (typeof value === 'number' ? value.toFixed(1) : value) + ` ${unit}`;
};
    
    
    const filterEnglishTags = (tags) => {
        if (!tags) return null;
        
        
        const englishTags = tags
            .filter(tag => tag.startsWith('en:'))
            .map(tag => tag.replace('en:', '').replace(/-/g, ' ')); 

        
        if (englishTags.length === 0 && tags.length > 0) {
             return tags[0].replace('en:', '').replace(/-/g, ' ');
        }
        
        return englishTags.length > 0 ? englishTags.join(', ') : null;
    };


    const handleSearch = useCallback(async (query) => {
        setIsSearching(true);
        try {
            if (!token) {
                setError('You must be logged in to search.');
                setIsSearching(false);
                return;
            }
            
            
            const response = await axios.get(`http://localhost:5000/api/list/search?q=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const products = response.data.products || [];
            
            setSearchResults(products.slice(0, 10).map(p => ({
                name: p.product_name || p.generic_name || `Item Code: ${p.code}`,
                code: p.code,
                brands: p.brands_tags ? p.brands_tags.join(',').replace(/tag:/g, '').replace(/-/g, ' ') : 'N/A',
                thumb_url: p.image_thumb_url,
                
                
                ingredients: p.ingredients_text_en || p.ingredients_text || null,
                
                
                allergens: filterEnglishTags(p.allergens_tags),
                labels: filterEnglishTags(p.labels_tags),
                categories: filterEnglishTags(p.categories_tags) ? filterEnglishTags(p.categories_tags).replace(/, /g, ' > ') : null,
                
                serving_size: p.serving_size || null,
                
                calories: getNutrientValue(p, 'energy-kcal', true),
                fat: getNutrientValue(p, 'fat', true),
                saturated_fat: getNutrientValue(p, 'saturated-fat', true),
                carbohydrates: getNutrientValue(p, 'carbohydrates', true),
                sugars: getNutrientValue(p, 'sugars', true),
                protein: getNutrientValue(p, 'proteins', true),
                salt: getNutrientValue(p, 'salt', true)
            })));

        } catch (err) {
            console.error('Error searching:', err);
            setError(err.response?.data?.msg || 'Failed to perform search.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [token]);

    const debouncedSearchHandler = useMemo(
        () => debounce(handleSearch, 500),
        [handleSearch]
    );
    
    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setError(null);
        
        if (value.trim().length > 2) {
            debouncedSearchHandler(value);
            setIsSearching(true); 
        } else {
            debouncedSearchHandler.cancel && debouncedSearchHandler.cancel();
            setSearchResults([]); 
            setIsSearching(false);
        }
    };
    
    const addItemFromSearch = async (result) => {
        setError(null);
        try {
            if (!token) {
                setError('You must be logged in to add items.');
                return;
            }
            
            const newItem = { 
                product_name: result.name.trim(), 
                quantity: 1, 
                brands: result.brands || null, 
                thumb_url: result.thumb_url || null, 

                ingredients: result.ingredients || null,
                allergens: result.allergens || null,
                labels: result.labels || null,
                serving_size: result.serving_size || null,
                categories: result.categories || null,
                
                calories: result.calories || null,
                fat: result.fat || null,
                saturated_fat: result.saturated_fat || null,
                carbohydrates: result.carbohydrates || null,
                sugars: result.sugars || null,
                protein: result.protein || null,
                salt: result.salt || null
            }; 
            
            await axios.post('http://localhost:5000/api/list/items', newItem, 
                { headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setSearchTerm('');
            setSearchResults([]);
            if (onItemAdded) {
                onItemAdded();
            }
        } catch (err) {
            console.error('Error adding item:', err);
            setError(err.response?.data?.msg || 'Failed to add item to list.');
        }
    };

    const handleManualAdd = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            const manualResult = { 
                name: searchTerm.trim(), 
                brands: null, 
                thumb_url: null,
                ingredients: null, allergens: null, labels: null, serving_size: null, categories: null,
                fat: null, saturated_fat: null, carbohydrates: null, sugars: null, protein: null, salt: null
            };
            addItemFromSearch(manualResult);
        }
    };


    return (
        <div className="add-item-form">
            <form onSubmit={handleManualAdd}>
                <input
                    className='filter-input'
                    type="text"
                    placeholder="Search/Add new item..."
                    value={searchTerm}
                    onChange={handleChange}
                    required
                />
            </form>

            
            {isSearching && searchTerm.length > 2 && (
                <div className="search-status">Searching for "{searchTerm}"...</div>
            )}
            
            {searchResults.length > 0 && (
                <ul className="search-results">
                    {searchResults.map((result) => (
                        <li key={result.code} 
                            onClick={() => addItemFromSearch(result)}
                            style={{ cursor: 'pointer', background: '#333', padding: '10px', margin: '5px 0', display: 'flex', alignItems: 'center' }}
                        >
                        {result.thumb_url && (
                                <img 
                                    src={result.thumb_url} 
                                    alt={result.name} 
                                    style={{ width: '50px', height: '50px', marginRight: '10px', objectFit: 'contain' }}
                                />
                            )}
                            
                            
                            <div>
                                <strong>{result.name}</strong> 
                                <span style={{ display: 'block', fontSize: '0.8em', color: '#ccc' }}>
                                    {result.brands}
                                </span>
                            </div>
                            
                            <span style={{ marginLeft: 'auto', fontSize: '0.8em', color: '#646cff' }}>
                                (Click to add)
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="error" style={{ color: 'yellow' }}>{error}</p>}
        </div>
    );
}

export default GroceryItemForm;

