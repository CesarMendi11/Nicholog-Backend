const User = require('../models/User');
const jwt = require('jsonwebtoken');
// IMPORTANTE: Cambiamos a createAuditLog
const { createAuditLog } = require('./logger.service'); 

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// --- REGISTRO ---
const registerUser = async (userData) => {
    const { username, email, password } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('El usuario ya existe');
    }

    const user = await User.create({
        username,
        email,
        password
    });

    if (user) {
        // [AUDITORÍA] Actualizado al nuevo formato
        await createAuditLog(
            user._id,
            "AUTH_REGISTER",
            `Nuevo usuario registrado: ${email}`,
            { type: "User", id: user._id.toString(), name: user.username },
            { old: null, new: null }
        );

        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        };
    } else {
        throw new Error('Datos de usuario inválidos');
    }
};

// --- LOGIN ---
const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        
        // [AUDITORÍA] Actualizado al nuevo formato
        await createAuditLog(
            user._id,
            "AUTH_LOGIN",
            `Inicio de sesión exitoso: ${email}`,
            { type: "User", id: user._id.toString(), name: user.username },
            { old: null, new: null }
        );

        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        };
    } else {
        throw new Error('Credenciales inválidas');
    }
};

// --- ACTUALIZAR PERFIL ---
const updateProfile = async (userId, updateData) => {
    const user = await User.findById(userId);

    if (!user) throw new Error("Usuario no encontrado");

    if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({ email: updateData.email });
        if (emailExists) throw new Error("Ese correo ya está en uso.");
        user.email = updateData.email;
    }

    if (updateData.username) {
        user.username = updateData.username;
    }

    if (updateData.password) {
        user.password = updateData.password;
    }

    const updatedUser = await user.save();

    // [AUDITORÍA] Actualizado al nuevo formato
    await createAuditLog(
        userId,
        "AUTH_UPDATE_PROFILE",
        "El usuario actualizó su perfil",
        { type: "User", id: user._id.toString(), name: user.username },
        { old: null, new: null }
    );

    return {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
    };
};

module.exports = { registerUser, loginUser, updateProfile };