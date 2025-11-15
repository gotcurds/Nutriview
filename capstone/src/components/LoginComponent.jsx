import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const LoginComponent = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => { setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })); setError(null); 
};
  const handleSubmit = async (e) => { e.preventDefault(); setError(null); 
    try { 
        const response = await axios.post ('http://localhost:5000/api/auth/login', formData);
        const { access_token, user_id } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_id', user_id);

        if (onLoginSuccess) {
            onLoginSuccess();
        }

        navigate('/dashboard');
    } catch (err) {
        if (err.response && err.response.data && err.response.data.msg) {
            setError(err.response.data.msg);
        } else {
            setError('Login failed due to a network or server error.');
        }
    } 
};
return (
    <div className="auth-container">
        <div className="auth-form-card">
            <h2>Log In</h2>
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
                {error && <p className="error" style={{ color: 'yellow' }}>{error}</p>}
                <button type="submit">Log In</button>
            </form>
            <p>
                Don't have an account? <a href="/signup">Sign Up here</a>
            </p>
        </div>
    </div>
    );
};

export default LoginComponent;