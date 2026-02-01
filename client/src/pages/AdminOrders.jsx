import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaBoxOpen, FaUtensils, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function AdminOrders() {
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

            return () => {
                socket.off('new-order');
            };
        }
    }, [socket]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
            toast.success('Order status updated!');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusConfig = (status) => {
        const config = {
            RECEIVED: { icon: FaBoxOpen, color: 'var(--color-info)', next: 'IN_KITCHEN', nextLabel: 'Start Cooking' },
            IN_KITCHEN: { icon: FaUtensils, color: 'var(--color-warning)', next: 'SENT_TO_DELIVERY', nextLabel: 'Send to Delivery' },
            SENT_TO_DELIVERY: { icon: FaTruck, color: 'var(--color-info)', next: 'DELIVERED', nextLabel: 'Mark Delivered' },
            DELIVERED: { icon: FaCheckCircle, color: 'var(--color-success)', next: null, nextLabel: null },
            PENDING: { icon: FaClock, color: 'var(--color-gray-500)', next: 'RECEIVED', nextLabel: 'Accept Order' },
        };
        return config[status] || config.PENDING;
    };

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Pending',
            RECEIVED: 'Received',
            IN_KITCHEN: 'In Kitchen',
            SENT_TO_DELIVERY: 'Out for Delivery',
            DELIVERED: 'Delivered',
            CANCELLED: 'Cancelled',
        };
        return labels[status] || status;
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter((order) => order.status === filter);

    const filterButtons = [
        { value: 'ALL', label: 'All' },
        { value: 'RECEIVED', label: 'Received' },
        { value: 'IN_KITCHEN', label: 'In Kitchen' },
        { value: 'SENT_TO_DELIVERY', label: 'Delivery' },
        { value: 'DELIVERED', label: 'Delivered' },
    ];

    return (
        <div>
            <AdminSidebar />

            <main className="main-content">
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                        Order Management 📋
                    </h1>
                    <span style={{ color: 'var(--color-gray-600)' }}>
                        {filteredOrders.length} order(s)
                    </span>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2" style={{ marginBottom: 'var(--spacing-6)' }}>
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
                    <div className="card card-body text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
                            No orders found
                        </h2>
                        <p style={{ color: 'var(--color-gray-600)' }}>
                            {filter === 'ALL' ? 'No orders have been placed yet.' : `No ${filter.toLowerCase()} orders.`}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div key={order.id} className="card">
                                    <div className="card-header flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>
                                                #{order.id.slice(-8).toUpperCase()}
                                            </span>
                                            <span
                                                className="badge"
                                                style={{
                                                    background: `${statusConfig.color}20`,
                                                    color: statusConfig.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                <StatusIcon size={12} />
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                        <span style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                            {new Date(order.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                            {/* Customer Info */}
                                            <div>
                                                <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-2)', color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                                    CUSTOMER
                                                </h4>
                                                <p style={{ fontWeight: 500 }}>{order.user.name}</p>
                                                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                                    {order.user.email}
                                                </p>
                                            </div>

                                            {/* Order Summary */}
                                            <div>
                                                <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-2)', color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                                    ORDER DETAILS
                                                </h4>
                                                <p>{order.items.length} pizza(s)</p>
                                                <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-primary)' }}>
                                                    Total: ₹{order.totalPrice.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div style={{ marginTop: 'var(--spacing-6)' }}>
                                            <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-3)', color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                                ITEMS
                                            </h4>
                                            <div className="flex flex-col gap-2">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-3" style={{ padding: 'var(--spacing-2)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                                                        <span>🍕</span>
                                                        <span style={{ fontWeight: 500 }}>
                                                            {item.base.name} + {item.sauce.name} + {item.cheese.name}
                                                        </span>
                                                        {item.veggies.length > 0 && (
                                                            <span style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                                                +{item.veggies.length} veggies
                                                            </span>
                                                        )}
                                                        {item.meats.length > 0 && (
                                                            <span style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                                                +{item.meats.length} meats
                                                            </span>
                                                        )}
                                                        <span style={{ marginLeft: 'auto', fontWeight: 500 }}>
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {statusConfig.next && (
                                        <div className="card-footer flex justify-end">
                                            <button
                                                onClick={() => updateStatus(order.id, statusConfig.next)}
                                                className="btn btn-primary"
                                            >
                                                {statusConfig.nextLabel}
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
