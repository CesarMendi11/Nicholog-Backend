const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = 8080; // Puerto público para el Frontend/Móvil

app.use(cors());
app.use(morgan('dev')); // Para ver los logs de tráfico
app.use(express.json());

// --- REDIRECCIÓN DE TRÁFICO ---

// 1. Auth Service
app.use('/api/auth', proxy('http://localhost:5001'));

// 2. Catalog Service
// Nota: Catalog necesita validar usuarios, pero eso se maneja internamente con el token
app.use('/api/catalog', proxy('http://localhost:5002'));

// 3. Analytics Service
app.use('/api/analytics', proxy('http://localhost:5003'));

// 4. Upload Service
app.use('/api/upload', proxy('http://localhost:5004'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API GATEWAY NICHOLOG - FUNCIONANDO 🚀');
});

app.listen(PORT, () => {
    console.log(`GATEWAY corriendo en http://localhost:${PORT}`);
});