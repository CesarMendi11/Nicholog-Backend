const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
// IMPORTANTE: Asegúrate de que 'getMetricDetails' esté aquí dentro de las llaves {}
const { getDashboardStats, getMetricDetails } = require('../services/analytics.service');

// Ruta del Dashboard principal
router.get('/dashboard', protect, async (req, res) => {
    try {
        const stats = await getDashboardStats(req.user._id);
        res.json(stats);
    } catch (err) {
        console.error("Error en dashboard:", err);
        res.status(500).json({ message: "Error calculando estadísticas: " + err.message });
    }
});

// Ruta de Detalles (Drill-down)
router.get('/details/:metric', protect, async (req, res) => {
    try {
        // Llamamos a la función que probablemente estaba faltando o mal importada
        const details = await getMetricDetails(req.user._id, req.params.metric);
        res.json(details);
    } catch (err) {
        console.error("Error en detalles de métrica:", err);
        res.status(500).json({ message: "Error obteniendo detalles: " + err.message });
    }
});

module.exports = router;
