const express = require('express');
const router = express.Router();
const { uploadMiddleware } = require('../services/upload.service');

// POST /api/upload/image
router.post('/image', uploadMiddleware, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    res.json({
        message: "Imagen subida con éxito",
        imageUrl: req.file.path
    });
});

module.exports = router;