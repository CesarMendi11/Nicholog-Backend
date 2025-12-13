const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const seedDatabase = require('./src/seed/seeder');

// Rutas
const catalogRoutes = require('./src/routes/catalog.routes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// --- RUTAS ---

app.get('/', (req, res) => {
    res.send('CATALOG SERVICE NichoLog Corriendo 📦');
});

// Ruta de Seed (Aquí sí va, porque aquí están los modelos)
app.get('/seed', seedDatabase);

// Rutas de la API
app.use('/', catalogRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`CATALOG SERVICE corriendo en puerto ${PORT}`);
    console.log(`Seed disponible en: http://localhost:${PORT}/seed`);
});