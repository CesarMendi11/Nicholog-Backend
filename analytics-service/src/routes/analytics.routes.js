const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware'); // <--- IMPORTANTE
const { getDashboardStats } = require('../services/analytics.service');

router.get('/dashboard', protect, async (req, res) => {
    try {
        // Ahora req.user sí existe gracias a 'protect'
        const stats = await getDashboardStats(req.user._id);
        res.json(stats);
    } catch (err) {
        console.error("Error en dashboard:", err);
        res.status(500).json({ message: "Error calculando estadísticas: " + err.message });
    }
});

module.exports = router;
