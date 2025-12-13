const mongoose = require('mongoose');

const CollectionTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,

    // Estructura dinámica del formulario (Molde)
    fields: [
        {
            fieldName: String,  // Ej: "Talla"
            fieldType: String,  // Ej: "number", "text", "selector"
            options: [String],  // Opciones si es un selector
            required: Boolean
        }
    ],

    // Referencia al dueño de la colección
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    createdAt: { type: Date, default: Date.now }
});

// REGLA DE UNICIDAD: Un usuario no puede tener dos colecciones con el mismo nombre.
CollectionTemplateSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('CollectionTemplate', CollectionTemplateSchema);