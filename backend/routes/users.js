const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user list for client dropdown (admin only)
router.get('/list', adminAuth, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, first_name, last_name, email FROM users WHERE role = ? ORDER BY first_name ASC',
            ['user']
        );
        res.json(users);
    } catch (error) {
        console.error('Get user list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single user (admin only)
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { username, first_name, last_name, email, role, password } = req.body;

        let query = 'UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, role = ?';
        const params = [username, first_name || '', last_name || '', email, role];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
