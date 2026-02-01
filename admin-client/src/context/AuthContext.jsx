import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('adminUser');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            api.get('/auth/me')
                .then((res) => {
                    if (res.data.data.role === 'ADMIN') {
                        setUser(res.data.data);
                    } else {
                        logout();
                    }
                })
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000');
            newSocket.emit('join-admin-room');
            setSocket(newSocket);
            return () => newSocket.close();
        }
    }, [user]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user: userData } = response.data.data;

        if (userData.role !== 'ADMIN') {
            throw new Error('Access denied. Admin only.');
        }

        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setUser(null);
        if (socket) socket.close();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, socket }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
