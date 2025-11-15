import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../App.css'; 

const SignupComponent = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    
    const handleChange = (e) => { 
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })); 
        setError(null);
    };

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        setError(null); 
        
        try {
            
            const response = await axios.post ('http://localhost:5000/api/auth/signup', formData);

            const { access_token, user_id } = response.data;
            
            
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user_id', user_id);
            
            
            navigate('/dashboard'); 

        } catch (err) {
            
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                setError('Signup failed due to a network or server error.');
            }
        }
    };
    
    return (
        <div className="auth-container">
            <div className="auth-form-card">
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
                    <button type="submit">Sign Up</button>
                </form>
                <p>
                    Already have an account? <a href="/login">Log In here</a>
                </p>
            </div>
        </div>
    );
}

export default SignupComponent;