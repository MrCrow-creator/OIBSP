import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaShoppingCart, FaClock, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('new-order', (data) => {
                fetchData();
            });

            return () => {
                socket.off('new-order');
            };
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

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'badge-warning',
            RECEIVED: 'badge-info',
            IN_KITCHEN: 'badge-warning',
            SENT_TO_DELIVERY: 'badge-info',
            DELIVERED: 'badge-success',
            CANCELLED: 'badge-error',
        };
        return colors[status] || 'badge-info';
    };

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Pending',
            RECEIVED: 'Received',
            IN_KITCHEN: 'In Kitchen',
            SENT_TO_DELIVERY: 'Delivery',
            DELIVERED: 'Delivered',
            CANCELLED: 'Cancelled',
        };
        return labels[status] || status;
    };

    return (
        <div>
            <AdminSidebar />

            <main className="main-content">
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-8)' }}>
                    Dashboard Overview 📊
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
                        <div className="spinner-lg"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(229, 57, 53, 0.1)', color: 'var(--color-primary)' }}>
                                    <FaShoppingCart />
                                </div>
                                <div className="stat-card-value">{stats?.totalOrders || 0}</div>
                                <div className="stat-card-label">Total Orders</div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(255, 152, 0, 0.1)', color: 'var(--color-warning)' }}>
                                    <FaClock />
                                </div>
                                <div className="stat-card-value">{stats?.pendingOrders || 0}</div>
                                <div className="stat-card-label">Pending Orders</div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: 'rgba(76, 175, 80, 0.1)', color: 'var(--color-success)' }}>
                                    <FaDollarSign />
                                </div>
                                <div className="stat-card-value">₹{(stats?.todayRevenue || 0).toFixed(0)}</div>
                                <div className="stat-card-label">Today's Revenue</div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-card-icon" style={{ background: stats?.lowStockCount > 0 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)', color: stats?.lowStockCount > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                                    <FaExclamationTriangle />
                                </div>
                                <div className="stat-card-value" style={{ color: stats?.lowStockCount > 0 ? 'var(--color-error)' : 'inherit' }}>
                                    {stats?.lowStockCount || 0}
                                </div>
                                <div className="stat-card-label">Low Stock Items</div>
                            </div>
                        </div>

                        {/* Low Stock Alert */}
                        {stats?.lowStockItems?.length > 0 && (
                            <div className="card" style={{ marginBottom: 'var(--spacing-8)', background: 'rgba(244, 67, 54, 0.05)', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                                <div className="card-body">
                                    <div className="flex items-center gap-3" style={{ marginBottom: 'var(--spacing-4)' }}>
                                        <FaExclamationTriangle color="var(--color-error)" />
                                        <h3 style={{ fontWeight: 600, color: 'var(--color-error)' }}>Low Stock Alert</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {stats.lowStockItems.map((item, index) => (
                                            <span key={index} className="badge badge-error">
                                                {item.name} ({item.type}): {item.stock} left
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Orders */}
                        <div className="card">
                            <div className="card-header flex items-center justify-between">
                                <h3 style={{ fontWeight: 600 }}>Recent Orders</h3>
                                <a href="/admin/orders" className="btn btn-secondary btn-sm">View All</a>
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
                                                <td style={{ fontWeight: 600 }}>
                                                    #{order.id.slice(-8).toUpperCase()}
                                                </td>
                                                <td>{order.user.name}</td>
                                                <td>{order.items.length} pizza(s)</td>
                                                <td>₹{order.totalPrice.toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${getStatusColor(order.status)}`}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--color-gray-600)' }}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
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
