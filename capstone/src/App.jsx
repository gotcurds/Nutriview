import React, { useState } from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom';


import LoginComponent from './components/LoginComponent.jsx';
import SignupComponent from './components/SignupComponent.jsx';
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx'; 
import UserGroceryList from './components/UserGroceryList.jsx'; 
import DeepDivePage from './components/DeepDivePage.jsx';     
import NavBar from './components/NavBar.jsx';

const App = () => {
    
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

    
    const handleLoginStatusChange = (status) => {
        setIsLoggedIn(status);
    };

    return (
        <div id="app">
            
            <NavBar
                isLoggedIn={isLoggedIn}
                handleLogout={() => handleLoginStatusChange(false)}
            />

            <main className="App-container">
                <Routes>
                    
                    <Route
                        path="/login"
                        element={<LoginComponent onLoginSuccess={() => handleLoginStatusChange(true)} />}
                    />

                    <Route path="/signup" element={<SignupComponent />} />

                    
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute> <UserGroceryList /> </ProtectedRoute>}
                    />
                    <Route
                        path="/all-items"
                        element={<ProtectedRoute> <DeepDivePage /> </ProtectedRoute>}
                    />

                    
                    <Route path="/list" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;