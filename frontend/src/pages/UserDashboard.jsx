import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ResultsDisplay from '../components/ResultsDisplay';

function UserDashboard() {
    const { logout, user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        person_age: '',
        person_income: '',
        person_emp_length: '',
        loan_amnt: '',
        loan_int_rate: '',
        loan_percent_income: '',
        cb_person_cred_hist_length: '',
        person_home_ownership: 'RENT',
        loan_intent: 'PERSONAL'
    });

    const [loading, setLoading] = useState(false);
    const [predictionResult, setPredictionResult] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setPredictionResult(null);

        const processedData = {
            ...formData,
            person_age: Number(formData.person_age),
            person_income: Number(formData.person_income),
            person_emp_length: Number(formData.person_emp_length),
            loan_amnt: Number(formData.loan_amnt),
            loan_int_rate: Number(formData.loan_int_rate),
            loan_percent_income: Number(formData.loan_amnt) / Number(formData.person_income),
            cb_person_cred_hist_length: Number(formData.cb_person_cred_hist_length)
        };

        try {
            const res = await axios.post('http://localhost:5000/api/predict/', processedData, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setPredictionResult(res.data);
        } catch (err) {
            setError('Prediction failed: ' + (err.response?.data?.msg || err.message));
        } finally { setLoading(false); }
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h2>📋 Loan Default Risk Assessment</h2>
                    <p>Enter applicant details to generate AI-powered credit risk analysis</p>
                </div>
                <button onClick={logout} className="secondary-btn" style={{ background: 'var(--navy)', color: '#fff', border: 'none' }}>Logout</button>
            </div>

            <div className="dashboard-layout">
                {/* Form Panel */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-header-icon">👤</div>
                        <h3>Loan Applicant Details</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                        Fill in the borrower's financial and personal information below. All fields are mandatory.
                    </p>

                    <form onSubmit={handlePredict} className="credit-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Age (Years)</label>
                                <input type="number" name="person_age" value={formData.person_age} onChange={handleChange} placeholder="e.g. 32" required />
                            </div>
                            <div className="input-group">
                                <label>Annual Income (₹)</label>
                                <input type="number" name="person_income" value={formData.person_income} onChange={handleChange} placeholder="e.g. 600000" required />
                            </div>
                            <div className="input-group">
                                <label>Employment Length (Yrs)</label>
                                <input type="number" name="person_emp_length" value={formData.person_emp_length} onChange={handleChange} placeholder="e.g. 5" required />
                            </div>
                            <div className="input-group">
                                <label>Credit History (Yrs)</label>
                                <input type="number" name="cb_person_cred_hist_length" value={formData.cb_person_cred_hist_length} onChange={handleChange} placeholder="e.g. 8" required />
                            </div>
                            <div className="input-group">
                                <label>Loan Amount (₹)</label>
                                <input type="number" name="loan_amnt" value={formData.loan_amnt} onChange={handleChange} placeholder="e.g. 250000" required />
                            </div>
                            <div className="input-group">
                                <label>Interest Rate (%)</label>
                                <input type="number" step="0.01" name="loan_int_rate" value={formData.loan_int_rate} onChange={handleChange} placeholder="e.g. 10.5" required />
                            </div>
                            <div className="input-group">
                                <label>Home Ownership</label>
                                <select name="person_home_ownership" value={formData.person_home_ownership} onChange={handleChange} className="modern-select">
                                    <option value="RENT">Rented</option>
                                    <option value="OWN">Self-Owned</option>
                                    <option value="MORTGAGE">Mortgage</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Loan Purpose</label>
                                <select name="loan_intent" value={formData.loan_intent} onChange={handleChange} className="modern-select">
                                    <option value="PERSONAL">Personal Loan</option>
                                    <option value="EDUCATION">Education Loan</option>
                                    <option value="MEDICAL">Medical Loan</option>
                                    <option value="VENTURE">Business / Venture</option>
                                    <option value="HOMEIMPROVEMENT">Home Improvement</option>
                                    <option value="DEBTCONSOLIDATION">Debt Consolidation</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="primary-btn predict-btn mt-4" style={{ maxWidth: '280px' }}>
                            {loading ? '⏳ Analyzing...' : '📊 Generate Credit Assessment'}
                        </button>
                    </form>

                    {error && <div className="error-message mt-3">{error}</div>}
                </div>

                {/* Results Panel */}
                <div>
                    {predictionResult ? (
                        <ResultsDisplay result={predictionResult} />
                    ) : (
                        <div className="card empty-results">
                            <div className="pulse-icon">🏦</div>
                            <p style={{ maxWidth: '280px', lineHeight: 1.6 }}>
                                Complete the applicant details and click <strong>'Generate Credit Assessment'</strong> to view the AI-powered risk report.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
