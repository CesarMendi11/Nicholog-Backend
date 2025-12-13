const mongoose = require('mongoose');

// NOTA: En Analytics Service no necesitamos bcrypt porque no hacemos login/registro.
// Solo necesitamos el esquema para que el middleware reconozca al usuario.

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// HEMOS BORRADO: pre('save') y methods.matchPassword
// porque aquí no se usan.

module.exports = mongoose.model('User', UserSchema);