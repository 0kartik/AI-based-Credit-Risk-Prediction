import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setValue(target); clearInterval(timer); }
            else { setValue(start); }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return value;
}

function AccuracyBar({ name, value, highlight }) {
    const animated = useCountUp(value * 100);
    const pct = animated.toFixed(1);
    const colorMap = {
        'Logistic Regression': '#002b5c',
        'Random Forest': '#15803d',
        'XGBoost': '#e87722',
    };
    const color = colorMap[name] || '#002b5c';

    return (
        <div className={`metric-card${highlight ? ' highlight' : ''}`}>
            <h5>{name}</h5>
            <div className="accuracy-bar-wrap">
                <div className="accuracy-bar-fill" style={{ width: `${pct}%`, background: color, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div className="score" style={{ color }}>{pct}%</div>
            <div className="accuracy-label">Test Accuracy</div>
        </div>
    );
}

function AdminDashboard() {
    const { logout, user } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [statusType, setStatusType] = useState('info');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [uploadDone, setUploadDone] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadDone(false);
        setResults(null);
        setStatus('');
    };

    const handleUpload = async () => {
        if (!file) { setStatus('Please select a CSV file.'); setStatusType('error'); return; }
        const formData = new FormData();
        formData.append('file', file);
        setLoading(true); setStatus('Uploading dataset...'); setStatusType('info');
        try {
            const res = await axios.post('http://localhost:5000/api/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${user.token}` }
            });
            setStatus(`✔ ${res.data.msg}`); setStatusType('success'); setUploadDone(true);
        } catch (error) {
            setStatus('Upload failed: ' + (error.response?.data?.msg || error.message)); setStatusType('error');
        } finally { setLoading(false); }
    };

    const handleTrain = async () => {
        if (!file) { setStatus('Upload a dataset first.'); setStatusType('error'); return; }
        setLoading(true); setStatus('Training ML models — please wait...'); setStatusType('info'); setResults(null);
        try {
            const res = await axios.post('http://localhost:5000/api/admin/train', { filename: file.name }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setStatus('✅ Training complete! Accuracy results displayed below.'); setStatusType('success');
            setResults(res.data.results);
        } catch (error) {
            setStatus('Training failed: ' + (error.response?.data?.msg || error.message)); setStatusType('error');
        } finally { setLoading(false); }
    };

    const models = results ? Object.entries(results) : [];
    const bestModel = results ? Object.entries(results).reduce((a, b) => (a[1] > b[1] ? a : b))[0] : null;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h2>🏛 Bank Admin — Model Management</h2>
                    <p>Upload historical credit datasets and train AI models for loan default prediction</p>
                </div>
                <button onClick={logout} className="secondary-btn" style={{ background: 'var(--navy)', color: '#fff', border: 'none' }}>Logout</button>
            </div>

            {/* Step 1: Upload */}
            <div className="card mt-3">
                <div className="card-header">
                    <div className="card-header-icon">📁</div>
                    <h3>Step 1 — Upload Training Dataset</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Select a CSV file containing historical loan data. The file must include a <code style={{ background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.8rem' }}>loan_status</code> target column.
                </p>
                <div className="custom-file-label mt-3">
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
                        <span className="file-btn">📂 Choose CSV File</span>
                        <span className="file-name">{file ? file.name : 'No file selected'}</span>
                    </label>
                </div>
                <button onClick={handleUpload} disabled={loading || !file} className="primary-btn mt-3" style={{ maxWidth: '200px' }}>
                    {loading && !results ? '⏳ Uploading...' : '⬆ Upload Dataset'}
                </button>
            </div>

            {/* Step 2: Train */}
            <div className={`card mt-3${!uploadDone ? ' dimmed' : ''}`}>
                <div className="card-header">
                    <div className="card-header-icon">⚙</div>
                    <h3>Step 2 — Train ML Models</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Run the AI training pipeline across Logistic Regression, Random Forest, and XGBoost algorithms.
                </p>
                <button onClick={handleTrain} disabled={loading || !uploadDone} className="accent-btn mt-3" style={{ maxWidth: '200px' }}>
                    {loading ? '⚙ Training...' : '🚀 Train Models'}
                </button>
            </div>

            {/* Status */}
            {status && (
                <div className={`status-banner mt-3 status-${statusType}`}>
                    <p>{status}</p>
                </div>
            )}

            {/* Results */}
            {results && (
                <div className="card mt-3 slide-up">
                    <div className="card-header">
                        <div className="card-header-icon" style={{ background: 'var(--green)' }}>📊</div>
                        <h3>Real-Time Model Accuracy Report</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        Best model: <strong style={{ color: 'var(--saffron)' }}>{bestModel}</strong> — this model will be used for live predictions.
                    </p>
                    <div className="model-metrics">
                        {models.map(([name, val]) => (
                            <AccuracyBar key={name} name={name} value={val} highlight={name === bestModel} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
