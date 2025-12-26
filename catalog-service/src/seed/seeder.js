const mongoose = require('mongoose');
const User = require('../models/User');
const CollectionTemplate = require('../models/CollectionTemplate');
const Item = require('../models/Item');
const Log = require('../models/Log');

const seedDatabase = async (req, res) => {
    try {
        // 1. Limpieza total
        await User.deleteMany({});
        await CollectionTemplate.deleteMany({});
        await Item.deleteMany({});
        await Log.deleteMany({});

        console.log("🧹 Base de datos limpiada.");

        // 2. Crear Usuario
        const user = await User.create({
            username: "JuanColeccionista",
            email: "juan@nicholog.com",
            password: "123456" 
        });

        console.log("✅ Usuario creado: juan@nicholog.com");

        // 3. Crear Colecciones (Moldes)
        
        // --- Colección 1: Zapatillas (Inversión Alta) ---
        const sneakers = await CollectionTemplate.create({
            name: "Zapatillas",
            userId: user._id,
            fields: [
                { name: "Modelo", type: "text-short", width: "half", isAnalyzable: true },
                { name: "Talla", type: "number", width: "half", isAnalyzable: true },
                { 
                    name: "Estado", 
                    type: "selector", 
                    width: "full",
                    options: ["Nuevo (DS)", "Usado (VNDS)", "Muy Usado"],
                    optionColors: { "Nuevo (DS)": "success", "Usado (VNDS)": "warning", "Muy Usado": "warn" },
                    isAnalyzable: true
                }
            ]
        });

        // --- Colección 2: Tecnología Retro (Nostalgia) ---
        const tech = await CollectionTemplate.create({
            name: "Tecnología Retro",
            userId: user._id,
            fields: [
                { name: "Tipo", type: "selector", options: ["Consola", "Portátil", "Accesorio"], width: "half", isAnalyzable: true },
                { name: "Año", type: "number", width: "half", isAnalyzable: true },
                { name: "Funciona", type: "checkbox", width: "full" }
            ]
        });

        // --- Colección 3: Comics (Volumen) ---
        const comics = await CollectionTemplate.create({
            name: "Comics",
            userId: user._id,
            fields: [
                { name: "Editorial", type: "selector", options: ["Marvel", "DC", "Image"], width: "half", isAnalyzable: true },
                { name: "Grado CGC", type: "number", width: "half", isAnalyzable: true }
            ]
        });

        console.log("✅ Colecciones creadas.");

        // 4. Crear Items (Inventario con Datos Financieros)

        // --- Zapatillas (Ganancia de valor) ---
        await Item.create({
            templateId: sneakers._id,
            name: "Air Jordan 1 High 'Chicago'",
            dynamicData: { "Modelo": "Lost & Found", "Talla": 10.5, "Estado": "Nuevo (DS)" },
            acquisition: { price: 180, estimatedValue: 450, currency: "USD", date: new Date("2022-11-19") },
            images: ["https://images.stockx.com/images/Air-Jordan-1-Retro-High-Chicago-Reimagined-Product.jpg"]
        });

        await Item.create({
            templateId: sneakers._id,
            name: "Nike Dunk Low 'Panda'",
            dynamicData: { "Modelo": "Retro White/Black", "Talla": 10, "Estado": "Usado (VNDS)" },
            acquisition: { price: 110, estimatedValue: 140, currency: "USD", date: new Date("2023-01-15") },
            images: []
        });

        await Item.create({
            templateId: sneakers._id,
            name: "Adidas Yeezy 350 V2 'Zebra'",
            dynamicData: { "Modelo": "CP9654", "Talla": 11, "Estado": "Muy Usado" },
            acquisition: { price: 220, estimatedValue: 180, currency: "USD", date: new Date("2017-02-25") }, // Pérdida de valor
            images: []
        });

        // --- Tecnología (Valor estable) ---
        await Item.create({
            templateId: tech._id,
            name: "Nintendo Game Boy (DMG-01)",
            dynamicData: { "Tipo": "Portátil", "Año": 1989, "Funciona": true },
            acquisition: { price: 50, estimatedValue: 120, currency: "USD", date: new Date("2019-08-10") },
            images: []
        });

        await Item.create({
            templateId: tech._id,
            name: "Sony Walkman TPS-L2",
            dynamicData: { "Tipo": "Accesorio", "Año": 1979, "Funciona": false },
            acquisition: { price: 200, estimatedValue: 500, currency: "USD", date: new Date("2020-01-15") },
            images: []
        });

        // --- Comics (Volumen bajo costo) ---
        await Item.create({
            templateId: comics._id,
            name: "Amazing Spider-Man #300",
            dynamicData: { "Editorial": "Marvel", "Grado CGC": 9.0 },
            acquisition: { price: 300, estimatedValue: 800, currency: "USD", date: new Date("2018-11-20") },
            images: []
        });

        await Item.create({
            templateId: comics._id,
            name: "Batman: The Killing Joke",
            dynamicData: { "Editorial": "DC", "Grado CGC": 9.8 },
            acquisition: { price: 50, estimatedValue: 100, currency: "USD", date: new Date("2021-03-05") },
            images: []
        });

        console.log("✅ Items insertados.");
        
        res.json({ 
            message: "Base de datos poblada con éxito", 
            user: "juan@nicholog.com",
            stats: { collections: 3, items: 7 }
        });

    } catch (error) {
        console.error("Error en Seed:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = seedDatabase;
