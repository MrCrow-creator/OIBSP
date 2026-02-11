import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getStatusConfig, ORDER_STATUS } from '../utils/constants';
import { FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { socket } = useAuth();

    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, currentPage]);

    useEffect(() => {
        if (socket) {
            socket.on('new-order', () => fetchOrders());
            return () => socket.off('new-order');
        }
    }, [socket]);

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams({ page: currentPage, limit: PAGE_SIZE });
            if (statusFilter !== 'ALL') params.append('status', statusFilter);
            const response = await api.get(`/admin/orders?${params}`);
            setOrders(response.data.data);
            if (response.data.total) {
                setTotalPages(Math.ceil(response.data.total / PAGE_SIZE));
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
            toast.success(`Status updated to ${getStatusConfig(newStatus).label}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const statusOptions = ['ALL', ...Object.keys(ORDER_STATUS)];

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-content">
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                        Orders 📋
                    </h1>
                </div>

                {/* Filter Bar */}
                <div className="card card-body" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div className="flex items-center gap-4 flex-wrap">
                        <FaFilter style={{ color: 'var(--color-gray-400)' }} />
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                {status === 'ALL' ? 'All' : getStatusConfig(status).label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
                        <div className="spinner-lg"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="card card-body text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <p style={{ color: 'var(--color-gray-500)' }}>No orders found</p>
                    </div>
                ) : (
                    <>
                        <div className="card">
                            <div className="card-body" style={{ padding: 0 }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => {
                                            const statusInfo = getStatusConfig(order.status);
                                            const StatusIcon = statusInfo.icon;

                                            return (
                                                <tr key={order.id}>
                                                    <td style={{ fontWeight: 600 }}>
                                                        #{order.id.slice(-8).toUpperCase()}
                                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                                                            {new Date(order.created_at).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>{order.user_name || order.user_email}</td>
                                                    <td>{order.item_count || '—'}</td>
                                                    <td style={{ fontWeight: 600 }}>
                                                        ₹{parseFloat(order.total_price).toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className="badge flex items-center gap-2"
                                                            style={{ background: `${statusInfo.color}18`, color: statusInfo.color }}
                                                        >
                                                            <StatusIcon size={12} />
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {statusInfo.next && (
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, statusInfo.next)}
                                                                className="btn btn-sm btn-primary"
                                                            >
                                                                {statusInfo.nextLabel}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4" style={{ marginTop: 'var(--spacing-6)' }}>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className="btn btn-ghost btn-sm"
                                    disabled={currentPage === 1}
                                >
                                    <FaChevronLeft /> Previous
                                </button>
                                <span style={{ color: 'var(--color-gray-600)' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className="btn btn-ghost btn-sm"
                                    disabled={currentPage === totalPages}
                                >
                                    Next <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
