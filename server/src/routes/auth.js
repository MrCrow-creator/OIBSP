const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, getOne } = require('../db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Check if user exists
        const existingUser = await getOne('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuidv4();

        // Create user
        const result = await query(
            `INSERT INTO users (email, password, name, role, verification_token) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role`,
            [email, hashedPassword, name, role || 'USER', verificationToken]
        );

        const user = result.rows[0];

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            data: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await getOne('SELECT * FROM users WHERE email = $1', [email]);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
            });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
        });
    }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await getOne(
            'SELECT id FROM users WHERE verification_token = $1',
            [token]
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token',
            });
        }

        await query(
            'UPDATE users SET email_verified = true, verification_token = NULL WHERE id = $1',
            [user.id]
        );

        res.json({
            success: true,
            message: 'Email verified successfully! You can now login.',
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed',
        });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await getOne('SELECT id FROM users WHERE email = $1', [email]);

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists, a reset link will be sent.',
            });
        }

        const resetToken = uuidv4();
        const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

        await query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
            [resetToken, resetExpiry, user.id]
        );

        await sendPasswordResetEmail(email, resetToken);

        res.json({
            success: true,
            message: 'If an account exists, a reset link will be sent.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request',
        });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await getOne(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [token]
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, user.id]
        );

        res.json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed',
        });
    }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
    res.json({
        success: true,
        data: req.user,
    });
});

module.exports = router;
