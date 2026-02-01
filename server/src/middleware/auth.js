const jwt = require('jsonwebtoken');
const { getOne } = require('../db');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await getOne(
            'SELECT id, email, name, role, email_verified FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before proceeding',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
            });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }
    next();
};

const isUser = (req, res, next) => {
    if (req.user.role !== 'USER') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. User privileges required.',
        });
    }
    next();
};

module.exports = { authenticate, isAdmin, isUser };
