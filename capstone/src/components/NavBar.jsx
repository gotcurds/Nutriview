import React from 'react';
import { Link, useNavigate } from 'react-router-dom';



const NavBar = ({ isLoggedIn, handleLogout }) => {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
       
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        
       
        handleLogout(); 
        
        
        navigate('/login');
    };

    return (
        <nav className="app-navbar">
            <div className="nav-inner-content">
                <Link to="/dashboard" className="nav-title">NutriView</Link>
                <div className="nav-links">
                    
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard">Food Finder</Link>
                            <Link to="/all-items">Deep Dive</Link>
                            <button onClick={handleLogoutClick} className="logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Log In</Link>
                            <Link to="/signup">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;