const express = require('express');
const { query, getOne, getAll } = require('../db');
const { authenticate, isAdmin } = require('../middleware/auth');
const { sendOrderStatusEmail } = require('../services/email');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate, isAdmin);

// Get all orders (with pagination + optional status filter)
router.get('/orders', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const status = req.query.status;

        let whereClause = '';
        const params = [];

        if (status) {
            whereClause = 'WHERE o.status = $1';
            params.push(status);
        }

        // Total count
        const countResult = await getOne(
            `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
            params
        );

        // Paginated result
        const queryParams = [...params, limit, offset];
        const orders = await getAll(
            `SELECT o.*, u.name as user_name, u.email as user_email,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ${whereClause}
             ORDER BY o.created_at DESC
             LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            queryParams
        );

        res.json({
            success: true,
            data: orders,
            total: parseInt(countResult.total),
            page,
            limit,
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
        });
    }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await query(
            `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 
       RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        const order = result.rows[0];

        // Get user email for notification
        const user = await getOne('SELECT email, name FROM users WHERE id = $1', [order.user_id]);

        // Send email notification
        await sendOrderStatusEmail(user.email, order.id.slice(-8).toUpperCase(), status);

        // Emit status update to user
        const io = req.app.get('io');
        io.to(`user-${order.user_id}`).emit('order-status-update', {
            orderId: order.id,
            status,
        });

        res.json({
            success: true,
            message: 'Order status updated',
            data: order,
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
        });
    }
});

// Get inventory
router.get('/inventory', async (req, res) => {
    try {
        const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
            getAll('SELECT * FROM pizza_bases ORDER BY name'),
            getAll('SELECT * FROM sauces ORDER BY name'),
            getAll('SELECT * FROM cheeses ORDER BY name'),
            getAll('SELECT * FROM veggies ORDER BY name'),
            getAll('SELECT * FROM meats ORDER BY name'),
        ]);

        // Get low stock items
        const lowStockItems = [];

        const allItems = [
            ...bases.map(i => ({ ...i, type: 'base' })),
            ...sauces.map(i => ({ ...i, type: 'sauce' })),
            ...cheeses.map(i => ({ ...i, type: 'cheese' })),
            ...veggies.map(i => ({ ...i, type: 'veggie' })),
            ...meats.map(i => ({ ...i, type: 'meat' })),
        ];

        for (const item of allItems) {
            if (item.stock <= item.threshold) {
                lowStockItems.push(item);
            }
        }

        res.json({
            success: true,
            data: { bases, sauces, cheeses, veggies, meats },
            lowStockItems,
        });
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory',
        });
    }
});

// Update inventory item
router.put('/inventory/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { name, description, price, stock, threshold, isActive } = req.body;

        const tableMap = {
            bases: 'pizza_bases',
            sauces: 'sauces',
            cheeses: 'cheeses',
            veggies: 'veggies',
            meats: 'meats',
        };

        const table = tableMap[type];
        if (!table) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item type',
            });
        }

        const result = await query(
            `UPDATE ${table} 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           threshold = COALESCE($5, threshold),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
            [name, description, price, stock, threshold, isActive, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        res.json({
            success: true,
            message: 'Item updated',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update item',
        });
    }
});

// Add inventory item
router.post('/inventory/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { name, description, price, stock, threshold } = req.body;

        const tableMap = {
            bases: 'pizza_bases',
            sauces: 'sauces',
            cheeses: 'cheeses',
            veggies: 'veggies',
            meats: 'meats',
        };

        const table = tableMap[type];
        if (!table) {
            return res.status(400).json({
                success: false,
                message: 'Invalid item type',
            });
        }

        const result = await query(
            `INSERT INTO ${table} (name, description, price, stock, threshold)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [name, description || '', price, stock || 100, threshold || 20]
        );

        res.status(201).json({
            success: true,
            message: 'Item added',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Add inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item',
        });
    }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total orders
        const totalOrders = await getOne('SELECT COUNT(*) as count FROM orders');

        // Pending orders
        const pendingOrders = await getOne(
            "SELECT COUNT(*) as count FROM orders WHERE status IN ('PENDING', 'RECEIVED', 'IN_KITCHEN')"
        );

        // Today's revenue
        const todayRevenue = await getOne(
            `SELECT COALESCE(SUM(total_price), 0) as sum FROM orders 
       WHERE created_at >= $1 AND status != 'CANCELLED'`,
            [today]
        );

        // Low stock count
        const lowStockItems = [];

        const tables = ['pizza_bases', 'sauces', 'cheeses', 'veggies', 'meats'];
        for (const table of tables) {
            const items = await getAll(
                `SELECT name, stock, threshold, '${table}' as type FROM ${table} WHERE stock <= threshold`
            );
            lowStockItems.push(...items);
        }

        res.json({
            success: true,
            data: {
                totalOrders: parseInt(totalOrders.count),
                pendingOrders: parseInt(pendingOrders.count),
                todayRevenue: parseFloat(todayRevenue.sum),
                lowStockCount: lowStockItems.length,
                lowStockItems,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats',
        });
    }
});

// Helper function to get order items
async function getOrderItems(orderId) {
    const items = await getAll(
        `SELECT oi.*, 
            pb.name as base_name,
            s.name as sauce_name,
            c.name as cheese_name
     FROM order_items oi
     LEFT JOIN pizza_bases pb ON oi.base_id = pb.id
     LEFT JOIN sauces s ON oi.sauce_id = s.id
     LEFT JOIN cheeses c ON oi.cheese_id = c.id
     WHERE oi.order_id = $1`,
        [orderId]
    );

    for (const item of items) {
        item.base = { id: item.base_id, name: item.base_name };
        item.sauce = { id: item.sauce_id, name: item.sauce_name };
        item.cheese = { id: item.cheese_id, name: item.cheese_name };

        item.veggies = await getAll(
            `SELECT v.id, v.name FROM order_item_veggies oiv
       JOIN veggies v ON oiv.veggie_id = v.id
       WHERE oiv.order_item_id = $1`,
            [item.id]
        );

        item.meats = await getAll(
            `SELECT m.id, m.name FROM order_item_meats oim
       JOIN meats m ON oim.meat_id = m.id
       WHERE oim.order_item_id = $1`,
            [item.id]
        );
    }

    return items;
}

module.exports = router;
