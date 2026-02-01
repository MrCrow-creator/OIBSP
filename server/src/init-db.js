const { pool, query } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function initDatabase() {
    console.log('🍕 Initializing Pizza Database...\n');

    try {
        // Create ENUM types
        await query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        await query(`
      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('PENDING', 'RECEIVED', 'IN_KITCHEN', 'SENT_TO_DELIVERY', 'DELIVERED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

        // Users table
        await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role user_role DEFAULT 'USER',
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Pizza bases table
        await query(`
      CREATE TABLE IF NOT EXISTS pizza_bases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 100,
        threshold INTEGER DEFAULT 20,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Sauces table
        await query(`
      CREATE TABLE IF NOT EXISTS sauces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 100,
        threshold INTEGER DEFAULT 20,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Cheeses table
        await query(`
      CREATE TABLE IF NOT EXISTS cheeses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 100,
        threshold INTEGER DEFAULT 20,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Veggies table
        await query(`
      CREATE TABLE IF NOT EXISTS veggies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 100,
        threshold INTEGER DEFAULT 20,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Meats table
        await query(`
      CREATE TABLE IF NOT EXISTS meats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 100,
        threshold INTEGER DEFAULT 20,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Orders table
        await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        total_price DECIMAL(10, 2) NOT NULL,
        status order_status DEFAULT 'PENDING',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Order items table
        await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        base_id UUID REFERENCES pizza_bases(id),
        sauce_id UUID REFERENCES sauces(id),
        cheese_id UUID REFERENCES cheeses(id),
        quantity INTEGER DEFAULT 1,
        item_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Order item veggies junction table
        await query(`
      CREATE TABLE IF NOT EXISTS order_item_veggies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        veggie_id UUID NOT NULL REFERENCES veggies(id)
      )
    `);

        // Order item meats junction table
        await query(`
      CREATE TABLE IF NOT EXISTS order_item_meats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
        meat_id UUID NOT NULL REFERENCES meats(id)
      )
    `);

        console.log('✅ Tables created successfully!\n');

        // Seed data
        await seedData();

        console.log('\n🎉 Database initialization completed!');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

async function seedData() {
    console.log('🌱 Seeding data...\n');

    // Seed admin user
    const adminEmail = 'admin@pizzaapp.com';
    const existingAdmin = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);

    if (existingAdmin.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await query(
            'INSERT INTO users (email, password, name, role, email_verified) VALUES ($1, $2, $3, $4, $5)',
            [adminEmail, hashedPassword, 'Pizza Admin', 'ADMIN', true]
        );
        console.log('✅ Admin user created: admin@pizzaapp.com / admin123');
    }

    // Seed test user
    const userEmail = 'user@test.com';
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [userEmail]);

    if (existingUser.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('user123', 10);
        await query(
            'INSERT INTO users (email, password, name, role, email_verified) VALUES ($1, $2, $3, $4, $5)',
            [userEmail, hashedPassword, 'Test User', 'USER', true]
        );
        console.log('✅ Test user created: user@test.com / user123');
    }

    // Seed pizza bases
    const bases = [
        { name: 'Classic Hand-Tossed', description: 'Traditional hand-tossed crust', price: 149 },
        { name: 'Thick Crust', description: 'Extra thick and fluffy', price: 169 },
        { name: 'Thin Crispy', description: 'Thin and crispy texture', price: 139 },
        { name: 'Stuffed Crust', description: 'Cheese-filled crust edge', price: 199 },
        { name: 'Whole Wheat', description: 'Healthy whole wheat option', price: 159 },
    ];

    for (const base of bases) {
        await query(
            'INSERT INTO pizza_bases (name, description, price) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
            [base.name, base.description, base.price]
        );
    }
    console.log('✅ Pizza bases seeded');

    // Seed sauces
    const sauces = [
        { name: 'Classic Marinara', description: 'Traditional tomato sauce', price: 29 },
        { name: 'Creamy Alfredo', description: 'Rich white sauce', price: 39 },
        { name: 'BBQ Sauce', description: 'Smoky BBQ flavor', price: 35 },
        { name: 'Pesto', description: 'Fresh basil pesto', price: 45 },
        { name: 'Buffalo Hot', description: 'Spicy buffalo sauce', price: 35 },
    ];

    for (const sauce of sauces) {
        await query(
            'INSERT INTO sauces (name, description, price) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
            [sauce.name, sauce.description, sauce.price]
        );
    }
    console.log('✅ Sauces seeded');

    // Seed cheeses
    const cheeses = [
        { name: 'Mozzarella', description: 'Classic melty cheese', price: 49 },
        { name: 'Cheddar', description: 'Sharp cheddar blend', price: 55 },
        { name: 'Parmesan', description: 'Aged parmesan', price: 65 },
        { name: 'Gouda', description: 'Smoked gouda', price: 69 },
        { name: 'Vegan Cheese', description: 'Plant-based option', price: 79 },
    ];

    for (const cheese of cheeses) {
        await query(
            'INSERT INTO cheeses (name, description, price) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
            [cheese.name, cheese.description, cheese.price]
        );
    }
    console.log('✅ Cheeses seeded');

    // Seed veggies
    const veggies = [
        { name: 'Bell Peppers', price: 25 },
        { name: 'Mushrooms', price: 30 },
        { name: 'Onions', price: 20 },
        { name: 'Olives', price: 35 },
        { name: 'Tomatoes', price: 25 },
        { name: 'Jalapeños', price: 25 },
        { name: 'Spinach', price: 30 },
        { name: 'Corn', price: 20 },
    ];

    for (const veggie of veggies) {
        await query(
            'INSERT INTO veggies (name, price) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
            [veggie.name, veggie.price]
        );
    }
    console.log('✅ Veggies seeded');

    // Seed meats
    const meats = [
        { name: 'Pepperoni', price: 55 },
        { name: 'Italian Sausage', price: 60 },
        { name: 'Grilled Chicken', price: 65 },
        { name: 'Bacon', price: 70 },
        { name: 'Ham', price: 55 },
    ];

    for (const meat of meats) {
        await query(
            'INSERT INTO meats (name, price) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
            [meat.name, meat.price]
        );
    }
    console.log('✅ Meats seeded');
}

initDatabase();
