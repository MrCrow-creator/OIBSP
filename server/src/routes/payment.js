const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', authenticate, async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
        });
    }
});

// Verify payment
router.post('/verify', authenticate, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            res.json({
                success: true,
                message: 'Payment verified successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
        });
    }
});

module.exports = router;
