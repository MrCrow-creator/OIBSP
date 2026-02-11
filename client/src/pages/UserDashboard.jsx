import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaPizzaSlice, FaPlus, FaHistory, FaFire } from 'react-icons/fa';
import { getStatusConfig } from '../utils/constants';

export default function UserDashboard() {
    const { user } = useAuth();
    const [featuredPizzas, setFeaturedPizzas] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pizzaRes, orderRes] = await Promise.all([
                api.get('/inventory/featured'),
                api.get('/orders/my-orders'),
            ]);
            setFeaturedPizzas(pizzaRes.data.data);
            setRecentOrders(orderRes.data.data.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />

            <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                {/* Welcome Section */}
                <div style={{ marginBottom: 'var(--spacing-10)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-2)' }}>
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-lg)' }}>
                        Ready to build your perfect pizza?
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--spacing-12)' }}>
                    <Link to="/build-pizza" className="card card-body" style={{ textAlign: 'center', textDecoration: 'none' }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            margin: '0 auto var(--spacing-4)',
                            background: 'var(--bg-gradient)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem'
                        }}>
                            <FaPlus />
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                            Build Pizza
                        </h3>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                            Create your custom masterpiece
                        </p>
                    </Link>

                    <Link to="/orders" className="card card-body" style={{ textAlign: 'center', textDecoration: 'none' }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            margin: '0 auto var(--spacing-4)',
                            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem'
                        }}>
                            <FaHistory />
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                            My Orders
                        </h3>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                            Track and view your orders
                        </p>
                    </Link>

                    <div className="card card-body" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            margin: '0 auto var(--spacing-4)',
                            background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem'
                        }}>
                            <FaFire />
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                            Special Offers
                        </h3>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                            Coming soon!
                        </p>
                    </div>
                </div>

                {/* Featured Pizzas */}
                <section style={{ marginBottom: 'var(--spacing-12)' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                            Featured Pizzas 🍕
                        </h2>
                        <Link to="/build-pizza" className="btn btn-secondary btn-sm">
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center" style={{ padding: 'var(--spacing-12)' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-6">
                            {featuredPizzas.map((pizza) => (
                                <div key={pizza.id} className="pizza-card">
                                    <div
                                        className="pizza-card-image"
                                        style={{ backgroundImage: `url(${pizza.image})` }}
                                    >
                                        <span className="pizza-card-badge">Popular</span>
                                    </div>
                                    <div className="pizza-card-content">
                                        <h3 className="pizza-card-title">{pizza.name}</h3>
                                        <p className="pizza-card-description">{pizza.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="pizza-card-price">₹{parseFloat(pizza.price).toFixed(2)}</span>
                                            <Link to="/build-pizza" className="btn btn-primary btn-sm">
                                                Order Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Recent Orders */}
                {recentOrders.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                Recent Orders
                            </h2>
                            <Link to="/orders" className="btn btn-secondary btn-sm">
                                View All
                            </Link>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td style={{ fontWeight: 600 }}>
                                                #{order.id.slice(-8).toUpperCase()}
                                            </td>
                                            <td>{order.items.length} pizza(s)</td>
                                            <td>₹{parseFloat(order.total_price).toFixed(2)}</td>
                                            <td>
                                                <span className={`badge ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-gray-600)' }}>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
