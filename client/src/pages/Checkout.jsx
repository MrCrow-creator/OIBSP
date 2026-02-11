import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaTrash, FaMinus, FaPlus, FaCreditCard, FaMapMarkerAlt } from 'react-icons/fa';

export default function Checkout() {
    const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({ line1: '', line2: '', city: '', pincode: '' });
    const navigate = useNavigate();

    const handlePayment = async () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty!');
            return;
        }

        if (!address.line1 || !address.city || !address.pincode) {
            toast.error('Please fill in your delivery address');
            return;
        }

        setLoading(true);

        try {
            // Initiate Razorpay order
            const orderResponse = await api.post('/payments/create-order', {
                amount: getTotal(),
            });

            const { order, key } = orderResponse.data;

            // Launch Razorpay checkout
            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: 'SliceCraft',
                description: 'Custom Pizza Order',
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // Verify payment signature
                        const verifyResponse = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyResponse.data.success) {
                            // Persist order in database
                            const items = cart.map((item) => ({
                                baseId: item.baseId,
                                sauceId: item.sauceId,
                                cheeseId: item.cheeseId,
                                veggieIds: item.veggieIds,
                                meatIds: item.meatIds,
                                itemPrice: item.itemPrice,
                                quantity: item.quantity || 1,
                            }));

                            await api.post('/orders', {
                                items,
                                totalPrice: getTotal(),
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                            });

                            clearCart();
                            toast.success('Order placed! Your pizza is on its way 🍕');
                            navigate('/orders');
                        }
                    } catch (error) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                theme: {
                    color: '#e53935',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast.error('Could not initiate payment. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />

            <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-8)' }}>
                    Checkout 🛒
                </h1>

                {cart.length === 0 ? (
                    <div className="card card-body text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-4)' }}>
                            Your cart is empty
                        </h2>
                        <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-6)' }}>
                            Head over to the pizza builder and craft something delicious!
                        </p>
                        <button onClick={() => navigate('/build-pizza')} className="btn btn-primary">
                            Build a Pizza
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 400px' }}>
                        {/* Cart Items */}
                        <div>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-4)' }}>
                                Your Pizzas ({cart.length})
                            </h2>

                            <div className="flex flex-col gap-4">
                                {cart.map((item) => (
                                    <div key={item.cartId} className="card card-body">
                                        <div className="flex gap-4">
                                            <div style={{
                                                width: 100,
                                                height: 100,
                                                background: 'var(--bg-gradient)',
                                                borderRadius: 'var(--radius-lg)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '2.5rem'
                                            }}>
                                                🍕
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                                                    Custom Pizza
                                                </h3>
                                                <div className="flex flex-wrap gap-2" style={{ marginBottom: 'var(--spacing-3)' }}>
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

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <FaMinus size={12} />
                                                        </button>
                                                        <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                                                            {item.quantity || 1}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                        >
                                                            <FaPlus size={12} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-primary)' }}>
                                                            ₹{(item.itemPrice * (item.quantity || 1)).toFixed(2)}
                                                        </span>
                                                        <button
                                                            onClick={() => removeFromCart(item.cartId)}
                                                            className="btn btn-ghost btn-icon"
                                                            style={{ color: 'var(--color-error)' }}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/build-pizza')}
                                className="btn btn-secondary"
                                style={{ marginTop: 'var(--spacing-4)' }}
                            >
                                + Add Another Pizza
                            </button>

                            {/* Delivery Address */}
                            <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
                                <div className="card-header">
                                    <h3 className="flex items-center gap-2" style={{ fontWeight: 600 }}>
                                        <FaMapMarkerAlt color="var(--color-primary)" /> Delivery Address
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="form-label">Address Line 1 *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="House/Flat No., Street"
                                            value={address.line1}
                                            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Address Line 2</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Landmark, Area (optional)"
                                            value={address.line2}
                                            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">City *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="City"
                                                value={address.city}
                                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">PIN Code *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="6-digit PIN"
                                                maxLength={6}
                                                value={address.pincode}
                                                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <div className="card" style={{ position: 'sticky', top: 100 }}>
                                <div className="card-header">
                                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                        Order Summary
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="flex flex-col gap-3" style={{ marginBottom: 'var(--spacing-6)' }}>
                                        {cart.map((item) => (
                                            <div key={item.cartId} className="flex justify-between">
                                                <span style={{ color: 'var(--color-gray-600)' }}>
                                                    Custom Pizza x{item.quantity || 1}
                                                </span>
                                                <span>₹{(item.itemPrice * (item.quantity || 1)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{
                                        borderTop: '2px solid var(--color-gray-200)',
                                        paddingTop: 'var(--spacing-4)',
                                        marginBottom: 'var(--spacing-6)'
                                    }}>
                                        <div className="flex justify-between" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                                            <span>Total</span>
                                            <span style={{ color: 'var(--color-primary)' }}>₹{getTotal().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                        style={{ width: '100%' }}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="spinner spinner-sm"></div>
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                <FaCreditCard /> Pay ₹{getTotal().toFixed(2)}
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center" style={{ marginTop: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                                        🔒 Secure payment via Razorpay
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
