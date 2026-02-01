import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaBoxOpen, FaUtensils, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const { socket } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('new-order', () => {
                fetchOrders();
                toast.success('New order received! 🍕');
            });
            return () => socket.off('new-order');
        }
    }, [socket]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrders(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success('Status updated!');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusConfig = (status) => {
        const config = {
            RECEIVED: { icon: FaBoxOpen, color: '#2196f3', next: 'IN_KITCHEN', nextLabel: 'Start Cooking' },
            IN_KITCHEN: { icon: FaUtensils, color: '#ff9800', next: 'SENT_TO_DELIVERY', nextLabel: 'Send to Delivery' },
            SENT_TO_DELIVERY: { icon: FaTruck, color: '#2196f3', next: 'DELIVERED', nextLabel: 'Mark Delivered' },
            DELIVERED: { icon: FaCheckCircle, color: '#4caf50', next: null },
            PENDING: { icon: FaClock, color: '#9e9e9e', next: 'RECEIVED', nextLabel: 'Accept Order' },
        };
        return config[status] || config.PENDING;
    };

    const filterButtons = [
        { value: 'ALL', label: 'All' },
        { value: 'RECEIVED', label: 'Received' },
        { value: 'IN_KITCHEN', label: 'Kitchen' },
        { value: 'SENT_TO_DELIVERY', label: 'Delivery' },
        { value: 'DELIVERED', label: 'Delivered' },
    ];

    const filteredOrders = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

    return (
        <div>
            <Sidebar />
            <main className="main-content">
                <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Order Management 📋</h1>
                    <span style={{ color: 'var(--color-gray-600)' }}>{filteredOrders.length} order(s)</span>
                </div>

                <div className="flex gap-2" style={{ marginBottom: '1.5rem' }}>
                    {filterButtons.map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => setFilter(btn.value)}
                            className={`btn ${filter === btn.value ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
                        <div className="spinner-lg"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="card card-body text-center" style={{ padding: '3rem' }}>
                        <p>No {filter === 'ALL' ? '' : filter.toLowerCase()} orders found</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredOrders.map((order) => {
                            const config = getStatusConfig(order.status);
                            const Icon = config.icon;

                            return (
                                <div key={order.id} className="card">
                                    <div className="card-header flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                                #{order.id.slice(-8).toUpperCase()}
                                            </span>
                                            <span className="badge" style={{ background: `${config.color}20`, color: config.color }}>
                                                <Icon size={12} style={{ marginRight: 4 }} />
                                                {order.status}
                                            </span>
                                        </div>
                                        <span style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
                                            {new Date(order.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-gray-500)', fontSize: '0.75rem' }}>CUSTOMER</h4>
                                                <p style={{ fontWeight: 500 }}>{order.user?.name}</p>
                                                <p style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>{order.user?.email}</p>
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-gray-500)', fontSize: '0.75rem' }}>ORDER</h4>
                                                <p>{order.items?.length} pizza(s)</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e53935' }}>
                                                    ₹{parseFloat(order.total_price || 0).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '1rem' }}>
                                            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-gray-500)', fontSize: '0.75rem' }}>ITEMS</h4>
                                            <div className="flex flex-col gap-2">
                                                {order.items?.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-3" style={{ padding: '0.5rem', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
                                                        <span>🍕</span>
                                                        <span style={{ fontWeight: 500 }}>
                                                            {item.base?.name} + {item.sauce?.name} + {item.cheese?.name}
                                                        </span>
                                                        <span style={{ marginLeft: 'auto', fontWeight: 500 }}>x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {config.next && (
                                        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button onClick={() => updateStatus(order.id, config.next)} className="btn btn-primary">
                                                {config.nextLabel}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
