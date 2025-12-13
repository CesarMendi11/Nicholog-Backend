const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// ENCRIPTACIÓN AUTOMÁTICA
// Se ejecuta antes de guardar el usuario en la DB
UserSchema.pre('save', async function() {
    // Si la contraseña no se modificó, no la volvemos a encriptar
    if (!this.isModified('password')) return;

    // Generar hash
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para verificar contraseña en el Login
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);