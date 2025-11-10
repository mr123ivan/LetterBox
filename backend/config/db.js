// db.js (in your config folder)

const mysql = require('mysql2');
require('dotenv').config();

// 1. Create a pool (more efficient for a server)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        // Handle specific error codes
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused. Check your credentials and server status.');
        }
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log(`✅ Successfully connected to database: ${process.env.DB_NAME}`);
    connection.release(); // Release the connection
});

module.exports = pool.promise(); // Export the promise-based pool for easy querying