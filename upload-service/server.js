const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// --- CORRECCIÓN IMPORTANTE ---
// Cargamos las variables de entorno ANTES de importar cualquier ruta o servicio
require('dotenv').config(); 

// Importación de Rutas (Ahora sí funcionará porque las vars ya existen)
const uploadRoutes = require('./src/routes/upload.routes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// --- RUTAS ---

app.get('/', (req, res) => {
    res.send('UPLOAD SERVICE NichoLog Corriendo 📷');
});

// CORRECCIÓN: Usamos la raíz '/' para que el Gateway funcione.
app.use('/', uploadRoutes);

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
    console.log(`UPLOAD SERVICE corriendo en puerto ${PORT}`);
});