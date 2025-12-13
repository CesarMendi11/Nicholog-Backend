const mongoose = require('mongoose');
const User = require('../models/User');
const CollectionTemplate = require('../models/CollectionTemplate');
const Item = require('../models/Item');
const Log = require('../models/Log');

const seedDatabase = async (req, res) => {
    try {
        // 1. Limpieza total de la Base de Datos
        await User.deleteMany({});
        await CollectionTemplate.deleteMany({});
        await Item.deleteMany({});
        await Log.deleteMany({});

        console.log("🧹 Base de datos limpiada.");

        // 2. Crear Usuarios
        // Nota: Se envía contraseña plana; el modelo User la encripta automáticamente.
        const user1 = await User.create({
            username: "JuanColeccionista",
            email: "juan@nicholog.com",
            password: "123456" 
        });

        const user2 = await User.create({
            username: "MariaGamer",
            email: "maria@nicholog.com",
            password: "123456"
        });

        console.log("✅ Usuarios creados.");

        // 3. Crear Colecciones (Moldes)
        // --- Juan ---
        const sneakersTemplate = await CollectionTemplate.create({
            name: "Zapatillas",
            description: "Mi colección personal de Air Jordan y Yeezy",
            userId: user1._id,
            fields: [
                { fieldName: "Marca", fieldType: "text_short" },
                { fieldName: "Talla", fieldType: "number" },
                { fieldName: "Condición", fieldType: "selector", options: ["DS (Nuevo)", "Usado"] }
            ]
        });

        const watchesTemplate = await CollectionTemplate.create({
            name: "Relojes",
            description: "Relojes automáticos y de cuarzo",
            userId: user1._id,
            fields: [
                { fieldName: "Marca", fieldType: "text_short" },
                { fieldName: "Movimiento", fieldType: "selector", options: ["Automático", "Cuarzo"] }
            ]
        });

        // --- Maria ---
        const gamesTemplate = await CollectionTemplate.create({
            name: "Videojuegos Retro",
            description: "Joyas de la era 8 y 16 bits",
            userId: user2._id,
            fields: [
                { fieldName: "Consola", fieldType: "selector", options: ["NES", "SNES", "N64", "Switch"] },
                { fieldName: "Completo", fieldType: "selector", options: ["CIB", "Cartucho"] },
                { fieldName: "Región", fieldType: "text_short" }
            ]
        });

        console.log("✅ Colecciones creadas.");

        // 4. Crear Items (Inventario)
        const items = await Item.insertMany([
            // --- ITEM 1: The Legend of Zelda (Maria) ---
            {
                templateId: gamesTemplate._id,
                name: "The Legend of Zelda",
                dynamicData: {
                    "Consola": "NES",
                    "Completo": "Cartucho",
                    "Región": "NTSC-U"
                },
                acquisition: {
                    price: 45, 
                    date: new Date('2018-06-20'),
                    estimatedValue: 120 
                },
                images: ["https://res.cloudinary.com/ds5f0xcdo/image/upload/v170000/nicholog_collections/item-12345.jpg"]
            },
            // --- Otros Items ---
            {
                templateId: gamesTemplate._id,
                name: "Super Mario 64",
                dynamicData: { "Consola": "N64", "Completo": "Solo Cartucho", "Región": "NTSC-U" },
                acquisition: { price: 30, estimatedValue: 45 },
                images: []
            },
            {
                templateId: sneakersTemplate._id,
                name: "Air Jordan 1 High 'Chicago'",
                dynamicData: { "Marca": "Nike", "Talla": 10.5, "Condición": "DS (Nuevo)" },
                acquisition: { price: 180, estimatedValue: 450 },
                images: []
            },
            {
                templateId: watchesTemplate._id,
                name: "Seiko 5 Sports",
                dynamicData: { "Marca": "Seiko", "Movimiento": "Automático" },
                acquisition: { price: 250, estimatedValue: 200 },
                images: []
            }
        ]);

        console.log("✅ Items creados.");

        // 5. Generar Logs Históricos (Inserción directa)
        await Log.create([
            {
                action: "CREATE_ITEM",
                description: "Se agregó el item 'The Legend of Zelda' a la colección",
                actor: { userId: user2._id, email: user2.email, username: user2.username },
                target: { entityType: "Item", entityId: items[0]._id, name: items[0].name },
                changes: { old: null, new: items[0] },
                timestamp: new Date()
            }
        ]);

        res.json({
            message: "✅ Base de datos reiniciada y poblada con éxito (SEED)",
            info: "Logins disponibles (Pass: 123456):",
            users: [
                { user: "Juan", email: "juan@nicholog.com" },
                { user: "Maria", email: "maria@nicholog.com" }
            ],
            stats: {
                collections: 3,
                items: items.length
            }
        });

    } catch (error) {
        console.error("Error en Seed:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = seedDatabase;