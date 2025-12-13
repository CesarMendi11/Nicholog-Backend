const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // Ej: "UPDATE_ITEM"
    
    // Descripción legible para humanos (Lectura rápida)
    description: String, 
    
    // Quién realizó la acción
    actor: {
        userId: String,
        email: String,
        username: String
    },

    // Qué objeto fue afectado
    target: {
        entityType: String, // "Collection" o "Item"
        entityId: String,
        name: String 
    },

    // Detalle técnico de cambios (Antes y Después)
    changes: {
        oldValue: Object,
        newValue: Object 
    },

    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);