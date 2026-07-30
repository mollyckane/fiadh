/*
This file is used to configure the database connection using environment variables
It uses the mysql2 library to create a connection pool for efficient database access.
The connection pool is exported for use in other parts of the application.
*/

const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from .env file

// Create a MySQL connection pool using the configuration from environment variables
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true'
        ? { ca: process.env.DB_CA_CERT, rejectUnauthorized: true }
        : undefined
});

// DEBUG: Test the database connection
// db.getConnection()
//     .then(conn => {
//         console.log('Connected to SQL database successfully.');
//         conn.release();
//     })
//     .catch(err => {
//         console.error('Database connection failed:', err);
//     });

module.exports = db;