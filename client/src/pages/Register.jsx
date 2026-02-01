import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPizzaSlice, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

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

        setLoading(true);

        try {
            await register(name, email, password, role);
            toast.success('Registration successful! Please check your email to verify your account.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: 'var(--spacing-8) 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: 480, margin: 'var(--spacing-4)' }}>
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
                            Create Account
                        </h1>
                        <p style={{ color: 'var(--color-gray-600)' }}>
                            Join us and start building your perfect pizza
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div className="flex gap-3" style={{ marginBottom: 'var(--spacing-6)' }}>
                        <button
                            type="button"
                            onClick={() => setRole('USER')}
                            className={`btn flex-1 ${role === 'USER' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            I'm a Customer
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('ADMIN')}
                            className={`btn flex-1 ${role === 'ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            I'm an Admin
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <FaUser style={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-gray-400)'
                                }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{ paddingLeft: 44 }}
                                />
                            </div>
                        </div>

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
                            <label className="form-label">Confirm Password</label>
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
                                    placeholder="Confirm your password"
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
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center" style={{ marginTop: 'var(--spacing-6)' }}>
                        <p style={{ color: 'var(--color-gray-600)' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
