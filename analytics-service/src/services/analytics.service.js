const mongoose = require('mongoose');
const Item = require('../models/Item');
const CollectionTemplate = require('../models/CollectionTemplate');

const getDashboardStats = async (userId) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Pipeline base para filtrar por usuario
        const pipeline = [
            {
                $lookup: {
                    from: 'collectiontemplates',
                    localField: 'templateId',
                    foreignField: '_id',
                    as: 'template'
                }
            },
            { $unwind: '$template' },
            { $match: { 'template.userId': userObjectId } }
        ];

        // 1. Calcular Totales
        const totals = await Item.aggregate([
            ...pipeline,
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: '$acquisition.price' },
                    totalValue: { $sum: '$acquisition.estimatedValue' },
                    itemCount: { $sum: 1 }
                }
            }
        ]);

        const stats = totals.length > 0 ? totals[0] : { totalCost: 0, totalValue: 0, itemCount: 0 };

        // 2. Distribución por Categoría
        const distribution = await Item.aggregate([
            ...pipeline,
            {
                $group: {
                    _id: '$template.name',
                    value: { $sum: '$acquisition.price' }
                }
            },
            { $project: { label: '$_id', value: 1, _id: 0 } },
            { $sort: { value: -1 } }
        ]);

        const totalInvested = stats.totalCost || 1;
        const categoryDistribution = distribution.map(cat => ({
            ...cat,
            percentage: Math.round((cat.value / totalInvested) * 100)
        }));

        // 3. NUEVO: Top 5 Artículos más Valiosos (Las "Joyas")
        const topItems = await Item.aggregate([
            ...pipeline,
            { $sort: { 'acquisition.estimatedValue': -1 } }, // Ordenar por valor descendente
            { $limit: 5 },
            { 
                $project: { 
                    name: 1, 
                    value: '$acquisition.estimatedValue', 
                    image: { $arrayElemAt: ['$images', 0] }, // Tomar la primera imagen
                    collectionName: '$template.name'
                } 
            }
        ]);

        return {
            totalCost: stats.totalCost,
            totalValue: stats.totalValue,
            itemCount: stats.itemCount,
            categoryDistribution,
            topItems // <--- Enviamos esto al frontend
        };

    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { getDashboardStats };
