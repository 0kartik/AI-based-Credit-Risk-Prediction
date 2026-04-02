import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-shell">
                    {/* Saffron Top Strip */}
                    <div className="bank-top-strip" />

                    {/* Navy Header */}
                    <header className="bank-header">
                        <div className="bank-header-brand">
                            <div className="bank-logo">₹</div>
                            <h1>
                                AI-Based Credit Risk &amp; Loan Default Prediction
                                <small>Powered by Machine Learning &bull; Secure &amp; Compliant</small>
                            </h1>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="app-body">
                        <AppRoutes />
                    </main>

                    {/* Footer — RBI Style */}
                    <footer className="bank-footer">
                        <div className="footer-divider" />
                        <strong>AI-Based Credit Risk & Loan Default Prediction System</strong>
                        <br />
                        This system is for authorized use only. All predictions are AI-generated assessments and
                        do not constitute financial advice.
                        <br />
                        Regulated under guidelines of the Reserve Bank of India (RBI) &bull; Data protected under IT Act, 2000
                        <br />
                        © 2026 Credit Risk Assessment Platform. All rights reserved.
                    </footer>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
