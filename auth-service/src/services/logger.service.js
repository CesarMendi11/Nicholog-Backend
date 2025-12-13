const Log = require('../models/Log');
const User = require('../models/User'); // Necesitamos buscar al usuario para sacar su email

// Función avanzada de auditoría
const createAuditLog = async (userId, action, description, target, changes) => {
    try {
        const user = await User.findById(userId);
        
        const logEntry = {
            action,
            description, // <--- Guardamos el texto simple aquí
            actor: {
                userId: user._id.toString(),
                email: user.email,
                username: user.username
            },
            target: {
                entityType: target.type,
                entityId: target.id,
                name: target.name
            },
            changes: {
                oldValue: changes.old || null,
                newValue: changes.new || null 
            }
        };

        await Log.create(logEntry);
        // Console log amigable
        console.log(`[AUDIT] ${description}`); 

    } catch (error) {
        console.error("Error guardando log de auditoría:", error);
    }
};

module.exports = { createAuditLog };