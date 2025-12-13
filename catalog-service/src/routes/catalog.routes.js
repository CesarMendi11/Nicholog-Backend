const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

const { 
    createCollection, getUserCollections, updateCollection, deleteCollection,
    createItem, getItemsByCollectionName, searchItems, getItemById, 
    updateItem, deleteItem, filterItems 
} = require('../services/catalog.service');

// --- COLECCIONES ---

// Crear Colección
router.post('/collections', protect, async (req, res) => {
    try {
        const result = await createCollection(req.user._id, req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Listar mis Colecciones
router.get('/collections', protect, async (req, res) => {
    try {
        const result = await getUserCollections(req.user._id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Editar Colección
router.put('/collections/:id', protect, async (req, res) => {
    try {
        const result = await updateCollection(req.user._id, req.params.id, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Eliminar Colección
router.delete('/collections/:id', protect, async (req, res) => {
    try {
        const result = await deleteCollection(req.user._id, req.params.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- ITEMS (INVENTARIO) ---

// Crear Item
router.post('/items', protect, async (req, res) => {
    try {
        const result = await createItem(req.user._id, req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ver Items por Nombre de Colección
router.get('/collections/:name/items', protect, async (req, res) => {
    try {
        const result = await getItemsByCollectionName(req.user._id, req.params.name);
        res.json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// Buscador Global (por nombre de item)
router.get('/search/:query', protect, async (req, res) => {
    try {
        const result = await searchItems(req.user._id, req.params.query);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ver detalle de Item único
router.get('/item-detail/:id', protect, async (req, res) => {
    try {
        const result = await getItemById(req.user._id, req.params.id);
        res.json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// Editar Item
router.put('/items/:id', protect, async (req, res) => {
    try {
        const result = await updateItem(req.user._id, req.params.id, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Eliminar Item
router.delete('/items/:id', protect, async (req, res) => {
    try {
        const result = await deleteItem(req.user._id, req.params.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Filtrado Avanzado (por campos dinámicos)
router.post('/filter/:id', protect, async (req, res) => {
    try {
        const result = await filterItems(req.user._id, req.params.id, req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;