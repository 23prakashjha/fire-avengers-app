const mysql = require('mysql2');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'fire_avengers';

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const pool = db.promise();

const createTables = [
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        first_name VARCHAR(50) NOT NULL DEFAULT '',
        last_name VARCHAR(50) NOT NULL DEFAULT '',
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS fire_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        client_id INT DEFAULT NULL,
        client_name VARCHAR(100) NOT NULL,
        serial_number VARCHAR(50) NOT NULL,
        installation_date DATE NOT NULL,
        city VARCHAR(100) NOT NULL DEFAULT '',
        area_name VARCHAR(100) NOT NULL,
        district_name VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        cylinder_size VARCHAR(50) NOT NULL,
        supply_type ENUM('supply_only', 'sitc') NOT NULL,
        handover_certificate VARCHAR(255),
        invoice_number VARCHAR(50) NOT NULL,
        vehicle_name ENUM('Kitelen', 'Panel', 'TRFS') NOT NULL,
        vehicle_number VARCHAR(50) NOT NULL,
        warranty_in_date DATE,
        warranty_over_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
    )`
];

const initDatabase = async () => {
    try {
        const conn = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        }).promise();
        await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
        await conn.end();

        for (const statement of createTables) {
            await pool.query(statement);
        }

        const [cols] = await pool.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'fire_data' AND COLUMN_NAME = 'city'",
            [DB_NAME]
        );
        if (cols.length === 0) {
            await pool.query("ALTER TABLE fire_data ADD COLUMN city VARCHAR(100) NOT NULL DEFAULT '' AFTER installation_date");
            console.log('Migration: Added city column to fire_data table');
        }

        const [firstNameCol] = await pool.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'first_name'",
            [DB_NAME]
        );
        if (firstNameCol.length === 0) {
            await pool.query("ALTER TABLE users ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT '' AFTER username");
            await pool.query("ALTER TABLE users ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT '' AFTER first_name");
            console.log('Migration: Added first_name, last_name columns to users table');
        }

        const [clientIdCol] = await pool.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'fire_data' AND COLUMN_NAME = 'client_id'",
            [DB_NAME]
        );
        if (clientIdCol.length === 0) {
            await pool.query("ALTER TABLE fire_data ADD COLUMN client_id INT DEFAULT NULL AFTER user_id");
            await pool.query("ALTER TABLE fire_data ADD FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL");
            console.log('Migration: Added client_id column to fire_data table');
        }

        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating database tables:', error);
    }
};

module.exports = pool;
module.exports.initDatabase = initDatabase;
