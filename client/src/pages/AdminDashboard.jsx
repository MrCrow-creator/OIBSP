import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaShoppingBag, FaClock, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import { getStatusConfig } from '../utils/constants';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('new-order', () => {
                fetchDashboardData();
            });

            return () => {
                socket.off('new-order');
            };
        }
    }, [socket]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/orders?limit=5'),
            ]);
            setStats(statsRes.data.data);
            setRecentOrders(ordersRes.data.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="card card-body" style={{ padding: 'var(--spacing-6)' }}>
            <div className="flex items-center gap-4">
                <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-xl)',
                    background: `${color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color,
                }}>
                    <Icon size={24} />
                </div>
                <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', marginBottom: 4 }}>
                        {label}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>{value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-content">
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-8)' }}>
                    Dashboard 📊
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
                        <div className="spinner-lg"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--spacing-8)' }}>
                            <StatCard icon={FaShoppingBag} label="Total Orders" value={stats?.totalOrders || 0} color="var(--color-primary)" />
                            <StatCard icon={FaClock} label="Pending" value={stats?.pendingOrders || 0} color="var(--color-warning)" />
                            <StatCard icon={FaDollarSign} label="Revenue" value={`₹${parseFloat(stats?.totalRevenue || 0).toLocaleString()}`} color="var(--color-success)" />
                            <StatCard icon={FaExclamationTriangle} label="Low Stock" value={stats?.lowStockItems || 0} color="var(--color-error)" />
                        </div>

                        {/* Recent Orders */}
                        <div className="card">
                            <div className="card-header flex items-center justify-between">
                                <h2 style={{ fontWeight: 600 }}>Recent Orders</h2>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => {
                                            const statusInfo = getStatusConfig(order.status);

                                            return (
                                                <tr key={order.id}>
                                                    <td style={{ fontWeight: 600 }}>#{order.id.slice(-8).toUpperCase()}</td>
                                                    <td>{order.user_name}</td>
                                                    <td>₹{parseFloat(order.total_price).toFixed(2)}</td>
                                                    <td>
                                                        <span
                                                            className="badge"
                                                            style={{ background: `${statusInfo.color}18`, color: statusInfo.color }}
                                                        >
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ color: 'var(--color-gray-500)' }}>
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
