const express = require('express');
const { query, getOne, getAll } = require('../db');
const { authenticate } = require('../middleware/auth');
const { decrementStock, checkAndAlertLowStock } = require('../services/inventory');

const router = express.Router();

// Create order
router.post('/', authenticate, async (req, res) => {
    try {
        const { items, totalPrice, razorpayOrderId, razorpayPaymentId } = req.body;
        const userId = req.user.id;

        // Create order
        const orderResult = await query(
            `INSERT INTO orders (user_id, total_price, status, razorpay_order_id, razorpay_payment_id)
       VALUES ($1, $2, 'RECEIVED', $3, $4) RETURNING *`,
            [userId, totalPrice, razorpayOrderId, razorpayPaymentId]
        );

        const order = orderResult.rows[0];

        // Create order items
        for (const item of items) {
            const itemResult = await query(
                `INSERT INTO order_items (order_id, base_id, sauce_id, cheese_id, quantity, item_price)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [order.id, item.baseId, item.sauceId, item.cheeseId, item.quantity || 1, item.itemPrice]
            );

            const orderItemId = itemResult.rows[0].id;

            // Add veggies
            if (item.veggieIds && item.veggieIds.length > 0) {
                for (const veggieId of item.veggieIds) {
                    await query(
                        'INSERT INTO order_item_veggies (order_item_id, veggie_id) VALUES ($1, $2)',
                        [orderItemId, veggieId]
                    );
                }
            }

            // Add meats
            if (item.meatIds && item.meatIds.length > 0) {
                for (const meatId of item.meatIds) {
                    await query(
                        'INSERT INTO order_item_meats (order_item_id, meat_id) VALUES ($1, $2)',
                        [orderItemId, meatId]
                    );
                }
            }
        }

        // Decrement stock
        await decrementStock(items);

        // Check for low stock alerts
        await checkAndAlertLowStock();

        // Emit new order event to admin
        const io = req.app.get('io');
        io.to('admin-room').emit('new-order', { orderId: order.id });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order,
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
        });
    }
});

// Get my orders
router.get('/my-orders', authenticate, async (req, res) => {
    try {
        const orders = await getAll(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );

        // Get items for each order
        for (const order of orders) {
            order.items = await getOrderItems(order.id);
        }

        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
        });
    }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
    try {
        const order = await getOne(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.items = await getOrderItems(order.id);

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
        });
    }
});

// Helper function to get order items with details
async function getOrderItems(orderId) {
    const items = await getAll(
        `SELECT oi.*, 
            pb.name as base_name, pb.price as base_price,
            s.name as sauce_name, s.price as sauce_price,
            c.name as cheese_name, c.price as cheese_price
     FROM order_items oi
     LEFT JOIN pizza_bases pb ON oi.base_id = pb.id
     LEFT JOIN sauces s ON oi.sauce_id = s.id
     LEFT JOIN cheeses c ON oi.cheese_id = c.id
     WHERE oi.order_id = $1`,
        [orderId]
    );

    for (const item of items) {
        // Format base, sauce, cheese
        item.base = { id: item.base_id, name: item.base_name, price: item.base_price };
        item.sauce = { id: item.sauce_id, name: item.sauce_name, price: item.sauce_price };
        item.cheese = { id: item.cheese_id, name: item.cheese_name, price: item.cheese_price };

        // Get veggies
        item.veggies = await getAll(
            `SELECT v.id, v.name, v.price 
       FROM order_item_veggies oiv
       JOIN veggies v ON oiv.veggie_id = v.id
       WHERE oiv.order_item_id = $1`,
            [item.id]
        );

        // Get meats
        item.meats = await getAll(
            `SELECT m.id, m.name, m.price 
       FROM order_item_meats oim
       JOIN meats m ON oim.meat_id = m.id
       WHERE oim.order_item_id = $1`,
            [item.id]
        );
    }

    return items;
}

// Cancel an order (user can cancel only if PENDING or RECEIVED)
router.patch('/:id/cancel', authenticate, isUser, async (req, res) => {
    try {
        const order = await db.getOne(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (!['PENDING', 'RECEIVED'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'This order can no longer be cancelled',
            });
        }

        await db.query(
            'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
            ['CANCELLED', order.id]
        );

        // Notify via socket
        const io = req.app.get('io');
        io.emit('order-status-update', { orderId: order.id, status: 'CANCELLED' });

        res.json({ success: true, message: 'Order cancelled' });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
