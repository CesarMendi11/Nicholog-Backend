const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getDashboardStats } = require('../services/analytics.service');

// GET /api/analytics/dashboard
// Obtiene estadísticas financieras, gráficas y items destacados.
router.get('/dashboard', protect, async (req, res) => {
    try {
        const stats = await getDashboardStats(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Error calculando estadísticas: " + error.message });
    }
});

module.exports = router;