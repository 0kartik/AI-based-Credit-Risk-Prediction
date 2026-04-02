import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple auth check on load
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        
        if (token && email && role) {
            setUser({ email, role, token });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const data = res.data;
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('email', data.email);
            localStorage.setItem('role', data.role);
            setUser({ email: data.email, role: data.role, token: data.access_token });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Login failed' };
        }
    };

    const signup = async (email, password, role = 'user') => {
        try {
            await axios.post('http://localhost:5000/api/auth/signup', { email, password, role });
            return await login(email, password);
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
