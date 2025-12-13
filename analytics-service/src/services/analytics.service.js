const Item = require('../models/Item');
const CollectionTemplate = require('../models/CollectionTemplate');

// --- FUNCIONES AUXILIARES ---

// Obtener el "Santo Grial" (Item más valioso)
const getTopItem = async (myTemplateIds) => {
    const topItem = await Item.find({
        templateId: { $in: myTemplateIds }
    })
    .sort({ 'acquisition.estimatedValue': -1 }) // Orden descendente por valor
    .limit(1)
    .select('name acquisition images'); 

    return topItem.length > 0 ? topItem[0] : null;
};

// Obtener actividad reciente (Timeline)
const getRecentActivity = async (myTemplateIds) => {
    const recentItems = await Item.find({
        templateId: { $in: myTemplateIds }
    })
    .sort({ createdAt: -1 }) // Orden descendente por fecha
    .limit(5)
    .select('name acquisition createdAt'); 

    return recentItems;
};

// --- FUNCIÓN PRINCIPAL DASHBOARD ---

const getDashboardStats = async (userId) => {
    // 1. Obtener colecciones del usuario
    const userCollections = await CollectionTemplate.find({ userId: userId });
    
    if (!userCollections.length) {
        return {
            totalInvestment: 0,
            totalValue: 0,
            profit: 0,
            itemCount: 0,
            chartData: [],
            topItem: null,
            recentActivity: []
        };
    }

    const collectionIds = userCollections.map(col => col._id);
    const items = await Item.find({ templateId: { $in: collectionIds } });

    // 2. Calcular Totales
    let totalInvestment = 0;
    let totalValue = 0;
    const distribution = {}; // Para el gráfico

    items.forEach(item => {
        totalInvestment += item.acquisition.price || 0;
        totalValue += item.acquisition.estimatedValue || 0;

        // Contar para gráfico por colección
        const colId = item.templateId.toString();
        distribution[colId] = (distribution[colId] || 0) + 1;
    });

    const profit = totalValue - totalInvestment;
    
    // Preparar datos para gráficos
    const chartData = userCollections.map(col => ({
        name: col.name,
        count: distribution[col._id.toString()] || 0
    })).filter(d => d.count > 0);

    // 3. Obtener Widgets adicionales
    const topItemResult = await getTopItem(collectionIds);
    const recentActivityResult = await getRecentActivity(collectionIds);

    return {
        totalInvestment,
        totalValue,
        profit,
        itemCount: items.length,
        chartData,
        topItem: topItemResult,
        recentActivity: recentActivityResult
    };
};

module.exports = { getDashboardStats };