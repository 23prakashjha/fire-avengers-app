const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed'));
    }
});

// Get all fire data
router.get('/', auth, async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT fd.*
             FROM fire_data fd
             WHERE fd.user_id = ?
             ORDER BY fd.created_at DESC`,
            [req.user.userId]
        );
        res.json(data);
    } catch (error) {
        console.error('Get fire data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all fire data (admin only)
router.get('/all', adminAuth, async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT fd.*
             FROM fire_data fd
             ORDER BY fd.created_at DESC`
        );
        res.json(data);
    } catch (error) {
        console.error('Get all fire data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search all fire data (admin only)
router.get('/all/search/:query', adminAuth, async (req, res) => {
    try {
        const query = `%${req.params.query}%`;
        const [data] = await db.query(
            `SELECT fd.*
             FROM fire_data fd
             WHERE (fd.client_name LIKE ? OR fd.serial_number LIKE ? OR fd.city LIKE ? OR fd.state LIKE ?
                    OR fd.district_name LIKE ? OR fd.area_name LIKE ? OR fd.invoice_number LIKE ?)
             ORDER BY fd.created_at DESC`,
            [query, query, query, query, query, query, query]
        );
        res.json(data);
    } catch (error) {
        console.error('Search all fire data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single fire data entry
router.get('/:id', auth, async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT fd.*
             FROM fire_data fd
             WHERE fd.id = ? AND fd.user_id = ?`,
            [req.params.id, req.user.userId]
        );

        if (data.length === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }

        res.json(data[0]);
    } catch (error) {
        console.error('Get fire data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search fire data
router.get('/search/:query', auth, async (req, res) => {
    try {
        const query = `%${req.params.query}%`;
        const [data] = await db.query(
            `SELECT fd.*
             FROM fire_data fd
             WHERE (fd.client_name LIKE ? OR fd.serial_number LIKE ? OR fd.city LIKE ? OR fd.state LIKE ?
                    OR fd.district_name LIKE ? OR fd.area_name LIKE ? OR fd.invoice_number LIKE ?)
                   AND fd.user_id = ?
             ORDER BY fd.created_at DESC`,
            [query, query, query, query, query, query, query, req.user.userId]
        );
        res.json(data);
    } catch (error) {
        console.error('Search fire data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new fire data entry
router.post('/', auth, upload.single('handover_certificate'), async (req, res) => {
    try {
        const {
            client_name,
            serial_number,
            installation_date,
            city,
            area_name,
            district_name,
            state,
            cylinder_size,
            supply_type,
            invoice_number,
            vehicle_name,
            vehicle_number,
            warranty_in_date,
            warranty_over_date
        } = req.body;

        const handover_certificate = req.file ? req.file.filename : null;
        const user_id = req.body.user_id || req.user.userId;

        const [result] = await db.query(
            `INSERT INTO fire_data 
             (user_id, client_name, serial_number, installation_date, city, area_name, district_name, state, 
              cylinder_size, supply_type, handover_certificate, invoice_number, vehicle_name, 
              vehicle_number, warranty_in_date, warranty_over_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                client_name,
                serial_number,
                installation_date,
                city,
                area_name,
                district_name,
                state,
                cylinder_size,
                supply_type,
                handover_certificate,
                invoice_number,
                vehicle_name,
                vehicle_number,
                warranty_in_date || null,
                warranty_over_date || null
            ]
        );

        res.status(201).json({ message: 'Fire data created successfully', id: result.insertId });
    } catch (error) {
        console.error('Create fire data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update fire data entry
router.put('/:id', auth, upload.single('handover_certificate'), async (req, res) => {
    try {
        const {
            client_name,
            serial_number,
            installation_date,
            city,
            area_name,
            district_name,
            state,
            cylinder_size,
            supply_type,
            invoice_number,
            vehicle_name,
            vehicle_number,
            warranty_in_date,
            warranty_over_date
        } = req.body;

        let handover_certificate = req.body.existing_certificate;
        if (Array.isArray(handover_certificate)) {
            handover_certificate = handover_certificate[handover_certificate.length - 1] || null;
        }
        if (req.file) {
            handover_certificate = req.file.filename;
        }

        const user_id = req.body.user_id || req.user.userId;

        const [result] = await db.query(
            `UPDATE fire_data 
             SET user_id = ?, client_name = ?, serial_number = ?, installation_date = ?, city = ?, area_name = ?,
                 district_name = ?, state = ?, cylinder_size = ?, supply_type = ?,
                 handover_certificate = ?, invoice_number = ?, vehicle_name = ?,
                 vehicle_number = ?, warranty_in_date = ?, warranty_over_date = ?
             WHERE id = ?`,
            [
                user_id,
                client_name,
                serial_number,
                installation_date,
                city,
                area_name,
                district_name,
                state,
                cylinder_size,
                supply_type,
                handover_certificate,
                invoice_number,
                vehicle_name,
                vehicle_number,
                warranty_in_date || null,
                warranty_over_date || null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }

        res.json({ message: 'Fire data updated successfully' });
    } catch (error) {
        console.error('Update fire data error:', error.message);
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(500).json({ message: 'Database schema mismatch. Please restart the backend server.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete fire data entry
router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM fire_data WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }

        res.json({ message: 'Fire data deleted successfully' });
    } catch (error) {
        console.error('Delete fire data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;