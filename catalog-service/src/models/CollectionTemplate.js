const mongoose = require('mongoose');

const CollectionTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,

    // Estructura dinámica del formulario (Molde)
    fields: [
        {
            name: String,
            // Envolvemos la definición en un objeto para usar 'type' como nombre de propiedad
            type: { type: String }, 
            options: [String],
            optionColors: { type: Map, of: String }, // Mapa de colores para badges
            required: Boolean,
            isAnalyzable: Boolean, // Para Analytics
            width: String          // Para Smart Layout ('full' | 'half')
        }
    ],

    // Referencia al dueño de la colección
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    createdAt: { type: Date, default: Date.now }
});

// REGLA DE UNICIDAD: Un usuario no puede tener dos colecciones con el mismo nombre.
CollectionTemplateSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('CollectionTemplate', CollectionTemplateSchema);
