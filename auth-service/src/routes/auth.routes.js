const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { registerUser, loginUser, updateProfile } = require('../services/auth.service');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser(email, password);
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const updatedUser = await updateProfile(req.user._id, req.body);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;