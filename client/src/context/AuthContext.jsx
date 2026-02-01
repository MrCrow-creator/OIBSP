import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initialize socket connection when user is authenticated
        if (user) {
            const newSocket = io('http://localhost:5000', {
                transports: ['websocket'],
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                if (user.role === 'ADMIN') {
                    newSocket.emit('join-admin-room');
                } else {
                    newSocket.emit('join-user-room', user.id);
                }
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            setUser(response.data.data.user);
            return response.data.data.user;
        }
        throw new Error(response.data.message);
    };

    const register = async (name, email, password, role = 'USER') => {
        const response = await api.post('/auth/register', { name, email, password, role });
        if (response.data.success) {
            return response.data;
        }
        throw new Error(response.data.message);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    const forgotPassword = async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    };

    const resetPassword = async (token, password) => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    };

    const value = {
        user,
        loading,
        socket,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        fetchUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
