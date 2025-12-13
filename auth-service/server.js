const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Importación SOLO de rutas de Auth
const authRoutes = require('./src/routes/auth.routes');

// Cargar variables de entorno
dotenv.config();

// Conectar a Base de Datos
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// --- RUTAS ---
app.get('/', (req, res) => {
    res.send('AUTH SERVICE NichoLog Corriendo 🔒');
});

app.use('/', authRoutes); 

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`AUTH SERVICE corriendo en puerto ${PORT}`);
});