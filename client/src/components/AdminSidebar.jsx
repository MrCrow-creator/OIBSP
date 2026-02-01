import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaPizzaSlice,
    FaChartBar,
    FaClipboardList,
    FaBoxes,
    FaSignOutAlt,
} from 'react-icons/fa';

export default function AdminSidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <FaPizzaSlice size={28} />
                <span>Pizza Admin</span>
            </div>

            <nav className="sidebar-nav">
                <Link
                    to="/admin"
                    className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
                >
                    <FaChartBar />
                    <span>Dashboard</span>
                </Link>
                <Link
                    to="/admin/orders"
                    className={`sidebar-link ${isActive('/admin/orders') ? 'active' : ''}`}
                >
                    <FaClipboardList />
                    <span>Orders</span>
                </Link>
                <Link
                    to="/admin/inventory"
                    className={`sidebar-link ${isActive('/admin/inventory') ? 'active' : ''}`}
                >
                    <FaBoxes />
                    <span>Inventory</span>
                </Link>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-6)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 'var(--spacing-4)' }}>
                    <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user?.name}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Administrator</div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="sidebar-link"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
