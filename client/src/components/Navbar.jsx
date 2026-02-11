import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPizzaSlice, FaUserCircle, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { getItemCount } = useCart();

    return (
        <nav className="navbar">
            <div className="container flex items-center justify-between">
                <Link to="/" className="navbar-brand">
                    <FaPizzaSlice />
                    <span>SliceCraft</span>
                </Link>

                <div className="navbar-nav">
                    {user ? (
                        <>
                            {user.role === 'USER' && (
                                <>
                                    <Link to="/dashboard" className="navbar-link">
                                        Dashboard
                                    </Link>
                                    <Link to="/build-pizza" className="navbar-link">
                                        Build Pizza
                                    </Link>
                                    <Link to="/orders" className="navbar-link">
                                        My Orders
                                    </Link>
                                    <Link to="/checkout" className="navbar-link" style={{ position: 'relative' }}>
                                        <FaShoppingCart size={20} />
                                        {getItemCount() > 0 && (
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    background: 'var(--color-primary)',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: 18,
                                                    height: 18,
                                                    fontSize: 11,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {getItemCount()}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}
                            {user.role === 'ADMIN' && (
                                <>
                                    <Link to="/admin" className="navbar-link">
                                        Dashboard
                                    </Link>
                                    <Link to="/admin/orders" className="navbar-link">
                                        Orders
                                    </Link>
                                    <Link to="/admin/inventory" className="navbar-link">
                                        Inventory
                                    </Link>
                                </>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="avatar">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <button onClick={logout} className="btn btn-ghost btn-sm">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
