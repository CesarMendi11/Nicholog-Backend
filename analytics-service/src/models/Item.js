const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    // Vinculación con el Molde (Colección padre)
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectionTemplate', required: true },
    
    name: { type: String, required: true },
    
    // DATOS DINÁMICOS: Almacena los campos variables (Talla, Año, etc.)
    // Se usa Map para permitir cualquier clave-valor definida en el molde.
    dynamicData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },

    // DATOS DE ADQUISICIÓN: Campos fijos financieros
    acquisition: {
        price: Number,           // Costo original
        date: Date,              // Fecha compra
        estimatedValue: Number   // Valor mercado actual
    },
    
    // Galería de imágenes (URLs de Cloudinary)
    images: [String],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', ItemSchema);