import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPizzaSlice, FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await forgotPassword(email);
            setSent(true);
            toast.success('Password reset email sent!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
            <div className="card" style={{ width: '100%', maxWidth: 440, margin: 'var(--spacing-4)' }}>
                <div className="card-body" style={{ padding: 'var(--spacing-8)' }}>
                    {/* Header */}
                    <div className="text-center" style={{ marginBottom: 'var(--spacing-8)' }}>
                        <div style={{
                            width: 60,
                            height: 60,
                            margin: '0 auto var(--spacing-4)',
                            background: 'var(--bg-gradient)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem'
                        }}>
                            <FaPizzaSlice />
                        </div>
                        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-2)' }}>
                            Forgot Password?
                        </h1>
                        <p style={{ color: 'var(--color-gray-600)' }}>
                            {sent
                                ? 'Check your email for reset instructions'
                                : 'Enter your email to receive a reset link'}
                        </p>
                    </div>

                    {sent ? (
                        <div className="text-center">
                            <div style={{
                                padding: 'var(--spacing-6)',
                                background: 'rgba(76, 175, 80, 0.1)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--spacing-6)'
                            }}>
                                <p style={{ color: 'var(--color-success)' }}>
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                            </div>
                            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <FaEnvelope style={{
                                        position: 'absolute',
                                        left: 16,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-gray-400)'
                                    }} />
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ paddingLeft: 44 }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                style={{ width: '100%', marginBottom: 'var(--spacing-4)' }}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="spinner spinner-sm"></div>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <Link to="/login" className="btn btn-ghost" style={{ width: '100%' }}>
                                <FaArrowLeft /> Back to Login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
