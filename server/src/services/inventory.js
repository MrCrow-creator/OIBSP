const { query, getAll } = require('../db');
const { sendLowStockAlert } = require('./email');

// Check inventory levels
const checkInventoryLevels = async () => {
    const lowStockItems = [];

    const tables = [
        { name: 'pizza_bases', type: 'Base' },
        { name: 'sauces', type: 'Sauce' },
        { name: 'cheeses', type: 'Cheese' },
        { name: 'veggies', type: 'Veggie' },
        { name: 'meats', type: 'Meat' },
    ];

    for (const table of tables) {
        const items = await getAll(
            `SELECT name, stock, threshold FROM ${table.name} WHERE stock <= threshold`
        );

        for (const item of items) {
            lowStockItems.push({
                name: item.name,
                type: table.type,
                stock: item.stock,
                threshold: item.threshold,
            });
        }
    }

    return lowStockItems;
};

// Decrement stock after order
const decrementStock = async (orderItems) => {
    for (const item of orderItems) {
        const quantity = item.quantity || 1;

        // Decrement base
        if (item.baseId) {
            await query(
                'UPDATE pizza_bases SET stock = stock - $1 WHERE id = $2',
                [quantity, item.baseId]
            );
        }

        // Decrement sauce
        if (item.sauceId) {
            await query(
                'UPDATE sauces SET stock = stock - $1 WHERE id = $2',
                [quantity, item.sauceId]
            );
        }

        // Decrement cheese
        if (item.cheeseId) {
            await query(
                'UPDATE cheeses SET stock = stock - $1 WHERE id = $2',
                [quantity, item.cheeseId]
            );
        }

        // Decrement veggies
        if (item.veggieIds && item.veggieIds.length > 0) {
            for (const veggieId of item.veggieIds) {
                await query(
                    'UPDATE veggies SET stock = stock - $1 WHERE id = $2',
                    [quantity, veggieId]
                );
            }
        }

        // Decrement meats
        if (item.meatIds && item.meatIds.length > 0) {
            for (const meatId of item.meatIds) {
                await query(
                    'UPDATE meats SET stock = stock - $1 WHERE id = $2',
                    [quantity, meatId]
                );
            }
        }
    }
};

// Check and alert for low stock
const checkAndAlertLowStock = async () => {
    const lowStockItems = await checkInventoryLevels();

    if (lowStockItems.length > 0) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            await sendLowStockAlert(adminEmail, lowStockItems);
        } else {
            console.log('⚠️ Low stock alert (no admin email configured):');
            console.log(lowStockItems);
        }
    }

    return lowStockItems;
};

module.exports = {
    checkInventoryLevels,
    decrementStock,
    checkAndAlertLowStock,
};
