const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// test connection on startup
db.getConnection()
    .then(conn => {
        console.log('Connected to Railway MySQL successfully.');
        conn.release(); // release back to the pool
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

module.exports = db;