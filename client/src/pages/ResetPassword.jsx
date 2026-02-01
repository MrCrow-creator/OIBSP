import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPizzaSlice, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (!token) {
            toast.error('Invalid reset link');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, password);
            toast.success('Password reset successful!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password reset failed.');
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
                            Reset Password
                        </h1>
                        <p style={{ color: 'var(--color-gray-600)' }}>
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <FaLock style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-gray-400)'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    style={{ paddingLeft: 44, paddingRight: 44 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 16,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-gray-400)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <FaLock style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-gray-400)'
                                }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={{ paddingLeft: 44 }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%', marginTop: 'var(--spacing-4)' }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="spinner spinner-sm"></div>
                                    Resetting...
                                </span>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="text-center" style={{ marginTop: 'var(--spacing-6)' }}>
                        <Link to="/login" style={{ color: 'var(--color-primary)' }}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
