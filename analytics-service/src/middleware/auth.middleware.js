const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Verificar si existe el header "Authorization" con formato Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraer el token (eliminar el prefijo "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // Verificar firma y decodificar
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Adjuntar el usuario a la request (sin la contraseña)
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token no autorizado o expirado' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Acceso denegado: No se proporcionó token' });
    }
};

module.exports = { protect };