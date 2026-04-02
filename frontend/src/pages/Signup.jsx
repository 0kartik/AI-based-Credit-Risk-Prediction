import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await signup(email, password, role);

        if (result.success) {
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="auth-secure-badge">🔒 Secure Registration</div>
                <h2>Create New Account</h2>
                <p className="auth-subtitle">Register to access the Credit Risk Assessment Portal</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Email ID</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="input-group">
                        <label>Set Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                        />
                    </div>
                    <div className="input-group">
                        <label>Account Type</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="modern-select">
                            <option value="user">User (Loan Applicant)</option>
                            <option value="admin">Admin (Bank Officer)</option>
                        </select>
                    </div>
                    <button type="submit" className="primary-btn mt-2">Register Account</button>

                    <p className="auth-link">
                        Already registered? <Link to="/login">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Signup;
