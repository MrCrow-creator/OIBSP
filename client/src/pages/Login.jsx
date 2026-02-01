import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPizzaSlice, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(email, password);
            toast.success('Welcome back! 🍕');
            navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
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
                        <div className="flex items-center justify-center gap-2" style={{ marginBottom: 'var(--spacing-4)' }}>
                            <div style={{
                                width: 60,
                                height: 60,
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
                        </div>
                        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-2)' }}>
                            Welcome Back!
                        </h1>
                        <p style={{ color: 'var(--color-gray-600)' }}>
                            Sign in to continue building pizzas
                        </p>
                    </div>

                    {/* Form */}
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

                        <div className="form-group">
                            <label className="form-label">Password</label>
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
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
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

                        <div className="flex justify-end" style={{ marginBottom: 'var(--spacing-6)' }}>
                            <Link to="/forgot-password" style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="spinner spinner-sm"></div>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center" style={{ marginTop: 'var(--spacing-6)' }}>
                        <p style={{ color: 'var(--color-gray-600)' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
