import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaPizzaSlice, FaLeaf, FaTruck, FaCreditCard, FaStar } from 'react-icons/fa';

const features = [
    {
        icon: <FaPizzaSlice size={28} />,
        title: 'Build Your Own',
        description: 'Choose from hand-picked bases, sauces, cheeses, and toppings to craft your signature slice.',
    },
    {
        icon: <FaLeaf size={28} />,
        title: 'Fresh Ingredients',
        description: 'Every ingredient is sourced fresh and stocked with care — never frozen, always flavorful.',
    },
    {
        icon: <FaTruck size={28} />,
        title: 'Live Order Tracking',
        description: 'Watch your order move from kitchen to doorstep with real-time status updates.',
    },
    {
        icon: <FaCreditCard size={28} />,
        title: 'Secure Payments',
        description: 'Pay confidently with Razorpay-powered checkout — fast, encrypted, reliable.',
    },
];

const testimonials = [
    { name: 'Arjun S.', text: 'The pizza builder is so fun! I love picking exactly what goes on my slice.', rating: 5 },
    { name: 'Priya M.', text: 'Ordered twice this week already. The real-time tracking is a game changer.', rating: 5 },
    { name: 'Rahul K.', text: 'Best custom pizza I\'ve had. Fresh toppings and lightning-fast delivery.', rating: 4 },
];

export default function LandingPage() {
    return (
        <div>
            <Navbar />

            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero-content container">
                    <h1 className="hero-title fade-in">
                        Craft Your <span style={{ color: 'rgba(255,255,255,0.9)' }}>Perfect</span> Slice
                    </h1>
                    <p className="hero-subtitle fade-in">
                        Hand-pick every ingredient. Built to order. Delivered to your door.
                    </p>
                    <div className="flex gap-4 justify-center fade-in">
                        <Link to="/build-pizza" className="btn btn-lg" style={{
                            background: 'white',
                            color: 'var(--color-primary)',
                            fontWeight: 700,
                        }}>
                            Start Building 🍕
                        </Link>
                        <Link to="/register" className="btn btn-lg" style={{
                            border: '2px solid white',
                            color: 'white',
                            background: 'transparent',
                        }}>
                            Create Account
                        </Link>
                    </div>

                    {/* Floating elements */}
                    <div className="hero-floating">
                        <span className="hero-float-item" style={{ top: '15%', left: '8%', animationDelay: '0s' }}>🍕</span>
                        <span className="hero-float-item" style={{ top: '60%', right: '10%', animationDelay: '1.5s' }}>🧀</span>
                        <span className="hero-float-item" style={{ bottom: '20%', left: '15%', animationDelay: '3s' }}>🌿</span>
                        <span className="hero-float-item" style={{ top: '25%', right: '20%', animationDelay: '0.8s' }}>🍅</span>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="container" style={{ padding: 'var(--spacing-16) var(--spacing-4)' }}>
                <h2 className="text-center" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-2)' }}>
                    Why SliceCraft?
                </h2>
                <p className="text-center" style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-12)', maxWidth: 500, margin: '0 auto var(--spacing-12)' }}>
                    We put you in charge of every layer — from crust to cheese to the last olive.
                </p>

                <div className="grid grid-cols-4 gap-6">
                    {features.map((feat, idx) => (
                        <div key={idx} className="card card-body text-center" style={{ padding: 'var(--spacing-8) var(--spacing-6)' }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                margin: '0 auto var(--spacing-4)',
                                background: 'rgba(229, 57, 53, 0.1)',
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-primary)',
                            }}>
                                {feat.icon}
                            </div>
                            <h3 style={{ fontWeight: 600, marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-lg)' }}>
                                {feat.title}
                            </h3>
                            <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
                                {feat.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section style={{ background: 'var(--color-gray-50)', padding: 'var(--spacing-16) 0' }}>
                <div className="container">
                    <h2 className="text-center" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-12)' }}>
                        Three Steps to Pizza Bliss
                    </h2>
                    <div className="grid grid-cols-3 gap-8">
                        {[
                            { step: '01', emoji: '🎨', title: 'Customize', desc: 'Pick your base, sauce, cheese, veggies, and meats from our fresh inventory.' },
                            { step: '02', emoji: '💳', title: 'Pay Securely', desc: 'Complete your order with a quick, secure Razorpay checkout.' },
                            { step: '03', emoji: '🚀', title: 'Track & Enjoy', desc: 'Follow your order in real-time until it\'s at your door.' },
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: 'var(--spacing-4)',
                                }}>
                                    {item.emoji}
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 700,
                                    color: 'var(--color-primary)',
                                    marginBottom: 'var(--spacing-2)',
                                    letterSpacing: '2px',
                                }}>
                                    STEP {item.step}
                                </div>
                                <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-2)' }}>
                                    {item.title}
                                </h3>
                                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', maxWidth: 280, margin: '0 auto' }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="container" style={{ padding: 'var(--spacing-16) var(--spacing-4)' }}>
                <h2 className="text-center" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-12)' }}>
                    What Our Customers Say
                </h2>
                <div className="grid grid-cols-3 gap-6">
                    {testimonials.map((t, idx) => (
                        <div key={idx} className="card card-body" style={{ padding: 'var(--spacing-6)' }}>
                            <div className="flex gap-1" style={{ marginBottom: 'var(--spacing-3)', color: '#FFB400' }}>
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <FaStar key={i} />
                                ))}
                            </div>
                            <p style={{ color: 'var(--color-gray-700)', fontStyle: 'italic', marginBottom: 'var(--spacing-4)', lineHeight: 1.6 }}>
                                "{t.text}"
                            </p>
                            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>— {t.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{
                background: 'var(--bg-gradient)',
                color: 'white',
                padding: 'var(--spacing-16) 0',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h2 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800, marginBottom: 'var(--spacing-4)' }}>
                        Ready to Craft Your Slice?
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9, marginBottom: 'var(--spacing-8)' }}>
                        Sign up free and start building your pizza in under a minute.
                    </p>
                    <Link to="/register" className="btn btn-lg" style={{
                        background: 'white',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        padding: 'var(--spacing-4) var(--spacing-10)',
                    }}>
                        Get Started — It's Free
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{
                background: 'var(--bg-dark)',
                color: 'rgba(255,255,255,0.5)',
                padding: 'var(--spacing-8) 0',
                textAlign: 'center',
                fontSize: 'var(--font-size-sm)',
            }}>
                <p>© {new Date().getFullYear()} SliceCraft. Built with ❤️ and fresh ingredients.</p>
            </footer>
        </div>
    );
}
