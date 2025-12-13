const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Rutas
const analyticsRoutes = require('./src/routes/analytics.routes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// --- RUTAS ---

app.get('/', (req, res) => {
    res.send('ANALYTICS SERVICE NichoLog Corriendo 📊');
});

// CORRECCIÓN: Usamos la raíz '/'
// El Gateway ya se encarga de manejar el prefijo '/api/analytics' antes de llegar aquí.
app.use('/', analyticsRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(`ANALYTICS SERVICE corriendo en puerto ${PORT}`);
});