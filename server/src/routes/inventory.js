const express = require('express');
const { getAll } = require('../db');

const router = express.Router();

// Get all ingredients
router.get('/all', async (req, res) => {
    try {
        const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
            getAll('SELECT * FROM pizza_bases WHERE is_active = true ORDER BY name'),
            getAll('SELECT * FROM sauces WHERE is_active = true ORDER BY name'),
            getAll('SELECT * FROM cheeses WHERE is_active = true ORDER BY name'),
            getAll('SELECT * FROM veggies WHERE is_active = true ORDER BY name'),
            getAll('SELECT * FROM meats WHERE is_active = true ORDER BY name'),
        ]);

        res.json({
            success: true,
            data: { bases, sauces, cheeses, veggies, meats },
        });
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory',
        });
    }
});

// Get featured pizzas (mock)
router.get('/featured', async (req, res) => {
    try {
        const featuredPizzas = [
            {
                id: '1',
                name: 'Margherita Classic',
                description: 'Fresh tomatoes, mozzarella, and basil',
                price: 299,
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
            },
            {
                id: '2',
                name: 'Pepperoni Supreme',
                description: 'Loaded with pepperoni and extra cheese',
                price: 399,
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
            },
            {
                id: '3',
                name: 'BBQ Chicken',
                description: 'Grilled chicken with BBQ sauce',
                price: 449,
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
            },
            {
                id: '4',
                name: 'Veggie Delight',
                description: 'Fresh vegetables with herbs',
                price: 349,
                image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400',
            },
        ];

        res.json({
            success: true,
            data: featuredPizzas,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured pizzas',
        });
    }
});

module.exports = router;
