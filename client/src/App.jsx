import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/UserDashboard';
import PizzaBuilder from './pages/PizzaBuilder';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminOrders from './pages/AdminOrders';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = ['USER', 'ADMIN'] }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-lg"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
    }

    return children;
}

// Admin Route
function AdminRoute({ children }) {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            {children}
        </ProtectedRoute>
    );
}

// User Route
function UserRoute({ children }) {
    return (
        <ProtectedRoute allowedRoles={['USER']}>
            {children}
        </ProtectedRoute>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#333',
                                color: '#fff',
                                borderRadius: '12px',
                                padding: '16px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#4caf50',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#f44336',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* User Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <UserRoute>
                                    <UserDashboard />
                                </UserRoute>
                            }
                        />
                        <Route
                            path="/build-pizza"
                            element={
                                <UserRoute>
                                    <PizzaBuilder />
                                </UserRoute>
                            }
                        />
                        <Route
                            path="/checkout"
                            element={
                                <UserRoute>
                                    <Checkout />
                                </UserRoute>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <UserRoute>
                                    <Orders />
                                </UserRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/inventory"
                            element={
                                <AdminRoute>
                                    <AdminInventory />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/orders"
                            element={
                                <AdminRoute>
                                    <AdminOrders />
                                </AdminRoute>
                            }
                        />

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
