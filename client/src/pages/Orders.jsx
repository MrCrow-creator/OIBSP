import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaCheckCircle, FaUtensils, FaTruck, FaBoxOpen, FaClock } from 'react-icons/fa';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('order-status-update', (data) => {
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === data.orderId ? { ...order, status: data.status } : order
                    )
                );
            });

            return () => {
                socket.off('order-status-update');
            };
        }
    }, [socket]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/my-orders');
            setOrders(response.data.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            PENDING: { icon: FaClock, label: 'Pending', color: 'var(--color-gray-500)', step: 0 },
            RECEIVED: { icon: FaBoxOpen, label: 'Order Received', color: 'var(--color-info)', step: 1 },
            IN_KITCHEN: { icon: FaUtensils, label: 'In the Kitchen', color: 'var(--color-warning)', step: 2 },
            SENT_TO_DELIVERY: { icon: FaTruck, label: 'Out for Delivery', color: 'var(--color-info)', step: 3 },
            DELIVERED: { icon: FaCheckCircle, label: 'Delivered', color: 'var(--color-success)', step: 4 },
            CANCELLED: { icon: FaClock, label: 'Cancelled', color: 'var(--color-error)', step: 0 },
        };
        return statusMap[status] || statusMap.PENDING;
    };

    const OrderStatusTracker = ({ status }) => {
        const statusInfo = getStatusInfo(status);
        const steps = [
            { icon: FaBoxOpen, label: 'Received' },
            { icon: FaUtensils, label: 'Kitchen' },
            { icon: FaTruck, label: 'Delivery' },
            { icon: FaCheckCircle, label: 'Delivered' },
        ];

        return (
            <div className="order-status">
                {steps.map((step, index) => {
                    const isCompleted = statusInfo.step > index + 1;
                    const isActive = statusInfo.step === index + 1;
                    const Icon = step.icon;

                    return (
                        <div
                            key={index}
                            className={`order-status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        >
                            <div className="order-status-icon">
                                <Icon />
                            </div>
                            <span className="order-status-label">{step.label}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            <Navbar />

            <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-8)' }}>
                    My Orders 📦
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
                        <div className="spinner-lg"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="card card-body text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
                            No orders yet
                        </h2>
                        <p style={{ color: 'var(--color-gray-600)' }}>
                            Start building your first pizza!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {orders.map((order) => {
                            const statusInfo = getStatusInfo(order.status);

                            return (
                                <div key={order.id} className="card">
                                    <div className="card-header flex items-center justify-between">
                                        <div>
                                            <span style={{ fontWeight: 600 }}>
                                                Order #{order.id.slice(-8).toUpperCase()}
                                            </span>
                                            <span style={{ color: 'var(--color-gray-500)', marginLeft: 'var(--spacing-4)' }}>
                                                {new Date(order.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <span
                                            className="badge"
                                            style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                                        >
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        {/* Status Tracker */}
                                        {order.status !== 'CANCELLED' && (
                                            <div style={{ marginBottom: 'var(--spacing-6)' }}>
                                                <OrderStatusTracker status={order.status} />
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        <div className="flex flex-col gap-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex gap-4" style={{ padding: 'var(--spacing-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                                    <div style={{
                                                        width: 60,
                                                        height: 60,
                                                        background: 'var(--bg-gradient)',
                                                        borderRadius: 'var(--radius-md)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.5rem'
                                                    }}>
                                                        🍕
                                                    </div>

                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                                                            Custom Pizza x{item.quantity}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="badge badge-info">{item.base.name}</span>
                                                            <span className="badge badge-warning">{item.sauce.name}</span>
                                                            <span className="badge badge-success">{item.cheese.name}</span>
                                                            {item.veggies.map((v) => (
                                                                <span key={v.id} className="badge" style={{ background: 'var(--color-gray-200)' }}>
                                                                    {v.name}
                                                                </span>
                                                            ))}
                                                            {item.meats.map((m) => (
                                                                <span key={m.id} className="badge badge-error">
                                                                    {m.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                                        ₹{parseFloat(item.item_price).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card-footer flex justify-between">
                                        <span style={{ color: 'var(--color-gray-600)' }}>
                                            {order.items.length} item(s)
                                        </span>
                                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                            Total: ₹{parseFloat(order.total_price).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
