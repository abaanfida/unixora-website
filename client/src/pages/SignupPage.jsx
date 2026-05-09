import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import './SignupPage.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const SignupPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        agree: false
    });
    const [status, setStatus] = useState({ error: '', success: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/chat');
        }
    }, [navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ error: '', success: '' });

        if (!emailRegex.test(formData.email)) {
            setStatus({ error: 'Please enter a valid email address.', success: '' });
            return;
        }

        if (!passwordRegex.test(formData.password)) {
            setStatus({ error: 'Password must be 8+ characters and include a number and a special character.', success: '' });
            return;
        }

        if (!formData.agree) {
            setStatus({ error: 'Please agree to the Terms & Conditions.', success: '' });
            return;
        }

        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim(),
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setStatus({ error: data.message || 'Could not create account.', success: '' });
                return;
            }

            // Store token and user data, then redirect to chat
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setStatus({ error: '', success: 'Account created! Redirecting...' });
            setTimeout(() => navigate('/chat'), 500);
        } catch (err) {
            setStatus({ error: 'Network error. Please try again.', success: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout>
            <div className="form-wrapper">
                <div className="form-header">
                    <h2>Create an account</h2>
                    <p>Already have an account? <Link to="/login">Log in</Link></p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group name-row">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First name"
                            className="input-field"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last name"
                            className="input-field"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="input-field"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="eye-icon"
                            onClick={togglePasswordVisibility}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            )}
                        </span>
                    </div>
                    <p className="helper-text">Use at least 8 characters with a number and a special symbol.</p>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="agree"
                            id="agree"
                            checked={formData.agree}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="agree">I agree to the <a href="#" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Terms & Conditions</a></label>
                    </div>

                    <button type="submit" className="create-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>

                    {status.error && <p className="form-message error">{status.error}</p>}
                    {status.success && <p className="form-message success">{status.success}</p>}
                </form>

                <div className="divider">
                    <span>Or register with</span>
                </div>

                <div className="social-buttons">
                    <button className="social-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button className="social-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.05 20.28c-.98.95-2.05 2.3-3.79 2.13-1.63-.16-2.14-1.02-4.04-1.05-1.92-.03-2.5.99-4.05 1.07-1.74.1-3.26-1.51-4.43-3.21-2.38-3.41-2.01-8.52 1.96-10.22 1.95-.83 3.73-.25 4.88-.23 1.13.02 2.89-1.09 4.79-.88 1.16.13 2.53.53 3.47 1.25-3.08 1.87-2.58 6.47.45 7.69-.64 1.57-1.68 3.16-2.66 4.14l-.02.02z" />
                        </svg>
                        Apple
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default SignupPage;
