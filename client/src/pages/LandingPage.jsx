import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FaPizzaSlice, FaShippingFast, FaCreditCard, FaStar } from 'react-icons/fa';

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (user) {
            navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div>
            <Navbar />

            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content">
                    <h1 className="hero-title">
                        Build Your Perfect Pizza 🍕
                    </h1>
                    <p className="hero-subtitle">
                        Customize every layer, from crust to toppings. Fresh ingredients, endless possibilities.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={handleGetStarted} className="btn btn-lg" style={{ background: 'white', color: 'var(--color-primary)' }}>
                            Get Started
                        </button>
                        <Link to="/login" className="btn btn-lg" style={{ background: 'transparent', border: '2px solid white', color: 'white' }}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: 'var(--spacing-16) 0' }}>
                <div className="container">
                    <h2 className="text-center" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-12)' }}>
                        Why Choose Us?
                    </h2>

                    <div className="grid grid-cols-4 gap-8">
                        <div className="card card-body text-center">
                            <div style={{
                                width: 80,
                                height: 80,
                                margin: '0 auto var(--spacing-5)',
                                background: 'var(--bg-gradient)',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem'
                            }}>
                                <FaPizzaSlice />
                            </div>
                            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                                Custom Pizzas
                            </h3>
                            <p style={{ color: 'var(--color-gray-600)' }}>
                                Choose from 5 bases, 5 sauces, multiple cheeses and unlimited toppings
                            </p>
                        </div>

                        <div className="card card-body text-center">
                            <div style={{
                                width: 80,
                                height: 80,
                                margin: '0 auto var(--spacing-5)',
                                background: 'var(--bg-gradient)',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem'
                            }}>
                                <FaStar />
                            </div>
                            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                                Premium Quality
                            </h3>
                            <p style={{ color: 'var(--color-gray-600)' }}>
                                Fresh ingredients sourced daily for the perfect taste
                            </p>
                        </div>

                        <div className="card card-body text-center">
                            <div style={{
                                width: 80,
                                height: 80,
                                margin: '0 auto var(--spacing-5)',
                                background: 'var(--bg-gradient)',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem'
                            }}>
                                <FaShippingFast />
                            </div>
                            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                                Fast Delivery
                            </h3>
                            <p style={{ color: 'var(--color-gray-600)' }}>
                                Track your order in real-time from kitchen to doorstep
                            </p>
                        </div>

                        <div className="card card-body text-center">
                            <div style={{
                                width: 80,
                                height: 80,
                                margin: '0 auto var(--spacing-5)',
                                background: 'var(--bg-gradient)',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem'
                            }}>
                                <FaCreditCard />
                            </div>
                            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                                Secure Payment
                            </h3>
                            <p style={{ color: 'var(--color-gray-600)' }}>
                                Safe and secure payments with Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: 'var(--spacing-16) 0', background: 'var(--color-gray-100)' }}>
                <div className="container text-center">
                    <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-4)' }}>
                        Ready to Build Your Pizza?
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-8)' }}>
                        Join thousands of pizza lovers and create your masterpiece today!
                    </p>
                    <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
                        Start Building Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: 'var(--spacing-8) 0', background: 'var(--bg-dark)', color: 'white' }}>
                <div className="container text-center">
                    <div className="flex items-center justify-center gap-2" style={{ marginBottom: 'var(--spacing-4)' }}>
                        <FaPizzaSlice size={24} />
                        <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Pizza App</span>
                    </div>
                    <p style={{ opacity: 0.7 }}>© 2024 Pizza App. Made with ❤️</p>
                </div>
            </footer>
        </div>
    );
}
