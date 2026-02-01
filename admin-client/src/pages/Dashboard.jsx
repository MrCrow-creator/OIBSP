import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaShoppingCart, FaClock, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('new-order', fetchData);
            return () => socket.off('new-order');
        }
    }, [socket]);

    const fetchData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/orders'),
            ]);
            setStats(statsRes.data.data);
            setRecentOrders(ordersRes.data.data.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            PENDING: 'badge-warning',
            RECEIVED: 'badge-info',
            IN_KITCHEN: 'badge-warning',
            SENT_TO_DELIVERY: 'badge-info',
            DELIVERED: 'badge-success',
            CANCELLED: 'badge-error',
        };
        return map[status] || 'badge-info';
    };

    return (
        <div>
            <Sidebar />
            <main className="main-content">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                    Dashboard Overview   📊
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
                        <div className="spinner-lg"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(229, 57, 53, 0.1)', color: '#e53935' }}>
                                    <FaShoppingCart />
                                </div>
                                <div className="stat-card-value">{stats?.totalOrders || 0}</div>
                                <div className="stat-card-label">Total Orders</div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}>
                                    <FaClock />
                                </div>
                                <div className="stat-card-value">{stats?.pendingOrders || 0}</div>
                                <div className="stat-card-label">Pending Orders</div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}>
                                    <FaDollarSign />
                                </div>
                                <div className="stat-card-value">₹{(stats?.todayRevenue || 0).toFixed(0)}</div>
                                <div className="stat-card-label">Today's Revenue</div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card-icon" style={{
                                    background: stats?.lowStockCount > 0 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                                    color: stats?.lowStockCount > 0 ? '#f44336' : '#4caf50'
                                }}>
                                    <FaExclamationTriangle />
                                </div>
                                <div className="stat-card-value" style={{ color: stats?.lowStockCount > 0 ? '#f44336' : 'inherit' }}>
                                    {stats?.lowStockCount || 0}
                                </div>
                                <div className="stat-card-label">Low Stock Items</div>
                            </div>
                        </div>

                        {stats?.lowStockItems?.length > 0 && (
                            <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(244, 67, 54, 0.05)', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                                <div className="card-body">
                                    <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                                        <FaExclamationTriangle color="#f44336" />
                                        <h3 style={{ fontWeight: 600, color: '#f44336' }}>Low Stock Alert</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.lowStockItems.map((item, i) => (
                                            <span key={i} className="badge badge-error">
                                                {item.name}: {item.stock} left
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card">
                            <div className="card-header flex items-center justify-between">
                                <span>Recent Orders</span>
                                <a href="/orders" className="btn btn-secondary btn-sm">View All</a>
                            </div>
                            <div className="table-container" style={{ boxShadow: 'none' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td style={{ fontWeight: 600 }}>#{order.id.slice(-8).toUpperCase()}</td>
                                                <td>{order.user?.name}</td>
                                                <td>{order.items?.length} pizza(s)</td>
                                                <td>₹{order.total_price?.toFixed(2)}</td>
                                                <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                                                <td style={{ color: 'var(--color-gray-600)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
