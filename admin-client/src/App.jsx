import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-lg"></div>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
