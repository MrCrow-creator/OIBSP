import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            verifyEmail(token);
        } else {
            setStatus('error');
            setMessage('Invalid verification link. No token provided.');
        }
    }, [searchParams]);

    const verifyEmail = async (token) => {
        try {
            const response = await api.get(`/auth/verify/${token}`);
            setStatus('success');
            setMessage(response.data.message);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
            <div className="card" style={{ width: '100%', maxWidth: 440, margin: 'var(--spacing-4)' }}>
                <div className="card-body text-center" style={{ padding: 'var(--spacing-10)' }}>
                    {status === 'loading' && (
                        <>
                            <FaSpinner size={60} style={{ margin: '0 auto var(--spacing-6)', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
                            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-3)' }}>
                                Verifying Email...
                            </h1>
                            <p style={{ color: 'var(--color-gray-600)' }}>
                                Please wait while we verify your email address.
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <FaCheckCircle size={60} style={{ margin: '0 auto var(--spacing-6)', color: 'var(--color-success)' }} />
                            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-3)' }}>
                                Email Verified! 🎉
                            </h1>
                            <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-6)' }}>
                                {message}
                            </p>
                            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Continue to Login
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <FaTimesCircle size={60} style={{ margin: '0 auto var(--spacing-6)', color: 'var(--color-error)' }} />
                            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-3)' }}>
                                Verification Failed
                            </h1>
                            <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-6)' }}>
                                {message}
                            </p>
                            <Link to="/register" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Try Again
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
