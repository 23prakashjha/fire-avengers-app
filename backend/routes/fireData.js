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

// Get all fire data for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const [data] = await db.query(
            'SELECT * FROM fire_data WHERE user_id = ? ORDER BY created_at DESC',
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
            `SELECT fd.*, u.username 
             FROM fire_data fd 
             JOIN users u ON fd.user_id = u.id 
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
            `SELECT fd.*, u.username 
             FROM fire_data fd 
             JOIN users u ON fd.user_id = u.id
             WHERE (fd.client_name LIKE ? OR fd.serial_number LIKE ? OR fd.state LIKE ? 
                    OR fd.invoice_number LIKE ? OR u.username LIKE ?)
             ORDER BY fd.created_at DESC`,
            [query, query, query, query, query]
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
            'SELECT * FROM fire_data WHERE id = ? AND user_id = ?',
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
            `SELECT * FROM fire_data 
             WHERE user_id = ? 
             AND (client_name LIKE ? OR serial_number LIKE ? OR state LIKE ? OR invoice_number LIKE ?)
             ORDER BY created_at DESC`,
            [req.user.userId, query, query, query, query]
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

        const [result] = await db.query(
            `INSERT INTO fire_data 
             (user_id, client_name, serial_number, installation_date, area_name, district_name, state, 
              cylinder_size, supply_type, handover_certificate, invoice_number, vehicle_name, 
              vehicle_number, warranty_in_date, warranty_over_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.userId,
                client_name,
                serial_number,
                installation_date,
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
        if (req.file) {
            handover_certificate = req.file.filename;
        }

        const isAdmin = req.user.role === 'admin';
        const whereClause = isAdmin ? 'id = ?' : 'id = ? AND user_id = ?';
        const whereParams = isAdmin ? [req.params.id] : [req.params.id, req.user.userId];

        const [result] = await db.query(
            `UPDATE fire_data 
             SET client_name = ?, serial_number = ?, installation_date = ?, area_name = ?, 
                 district_name = ?, state = ?, cylinder_size = ?, supply_type = ?, 
                 handover_certificate = ?, invoice_number = ?, vehicle_name = ?, 
                 vehicle_number = ?, warranty_in_date = ?, warranty_over_date = ?
             WHERE ${whereClause}`,
            [
                client_name,
                serial_number,
                installation_date,
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
                ...whereParams
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }

        res.json({ message: 'Fire data updated successfully' });
    } catch (error) {
        console.error('Update fire data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete fire data entry
router.delete('/:id', auth, async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const whereClause = isAdmin ? 'id = ?' : 'id = ? AND user_id = ?';
        const whereParams = isAdmin ? [req.params.id] : [req.params.id, req.user.userId];

        const [result] = await db.query(
            `DELETE FROM fire_data WHERE ${whereClause}`,
            whereParams
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
