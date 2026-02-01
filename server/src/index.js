const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import database
const { pool } = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Pizza API is running! 🍕' });
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room
    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
    });

    // Join admin room
    socket.on('join-admin-room', () => {
        socket.join('admin-room');
        console.log('Admin joined admin room');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🍕 Pizza server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for real-time updates`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await pool.end();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
