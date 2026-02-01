const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'pizza_db',
});

// Test connection
pool.on('connect', () => {
    console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Query helper
const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
        // console.log('Query executed', { text, duration, rows: res.rowCount });
    }
    return res;
};

// Get single row
const getOne = async (text, params) => {
    const res = await query(text, params);
    return res.rows[0];
};

// Get all rows
const getAll = async (text, params) => {
    const res = await query(text, params);
    return res.rows;
};

module.exports = {
    pool,
    query,
    getOne,
    getAll,
};
