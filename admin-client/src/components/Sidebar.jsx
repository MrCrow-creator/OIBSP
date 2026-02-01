import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPizzaSlice, FaChartBar, FaClipboardList, FaBox, FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: FaChartBar, label: 'Dashboard' },
        { to: '/orders', icon: FaClipboardList, label: 'Orders' },
        { to: '/inventory', icon: FaBox, label: 'Inventory' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <FaPizzaSlice size={28} />
                <span>Pizza</span> Admin
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        end={item.to === '/'}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button onClick={handleLogout} className="sidebar-link" style={{ marginTop: 'auto' }}>
                <FaSignOutAlt size={18} />
                Logout
            </button>
        </aside>
    );
}
