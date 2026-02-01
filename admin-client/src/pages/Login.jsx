import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPizzaSlice, FaEnvelope, FaLock } from 'react-icons/fa';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Welcome back, Admin! 🍕');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
            <div className="card" style={{ width: '100%', maxWidth: 400 }}>
                <div className="card-body" style={{ padding: '2rem' }}>
                    <div className="text-center" style={{ marginBottom: '2rem' }}>
                        <div style={{
                            width: 70,
                            height: 70,
                            margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, #e53935, #ff5722)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '2rem'
                        }}>
                            <FaPizzaSlice />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                            Admin Portal
                        </h1>
                        <p style={{ color: 'var(--color-gray-500)' }}>
                            Sign in to manage your pizza shop
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <FaEnvelope style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="admin@pizzaapp.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ paddingLeft: 40 }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <FaLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ paddingLeft: 40 }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {loading ? <div className="spinner"></div> : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
