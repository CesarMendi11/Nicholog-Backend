const mongoose = require('mongoose');
const Item = require('../models/Item');
const CollectionTemplate = require('../models/CollectionTemplate');

// --- FUNCIÓN 1: Estadísticas Generales ---
const getDashboardStats = async (userId) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);

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
            { $match: { 'template.userId': userObjectId }  }
        ];

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

        const topItems = await Item.aggregate([
            ...pipeline,
            { $sort: { 'acquisition.estimatedValue': -1 } },
            { $limit: 5 },
            { 
                $project: { 
                    name: 1, 
                    value: '$acquisition.estimatedValue', 
                    image: { $arrayElemAt: ['$images', 0] },
                    collectionName: '$template.name'
                } 
            }
        ]);

        return {
            totalCost: stats.totalCost,
            totalValue: stats.totalValue,
            itemCount: stats.itemCount,
            categoryDistribution,
            topItems
        };

    } catch (error) {
        throw new Error(error.message);
    }
};

// --- FUNCIÓN 2: Detalles (CORREGIDA) ---
const getMetricDetails = async (userId, metric) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

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

    let sortField;
    let valueField;
    let dateField = '$acquisition.date';

    switch (metric) {
        case 'costo':
            // CORRECCIÓN: Quitamos el '$' para el ordenamiento
            sortField = 'acquisition.price'; 
            // Mantenemos el '$' para obtener el valor
            valueField = '$acquisition.price';
            break;
        case 'valor':
            // CORRECCIÓN: Quitamos el '$'
            sortField = 'acquisition.estimatedValue';
            valueField = '$acquisition.estimatedValue';
            break;
        case 'items':
            // CORRECCIÓN: Quitamos el '$'
            sortField = 'createdAt';
            valueField = { $literal: null };
            dateField = '$createdAt';
            break;
        default:
            throw new Error('Métrica no válida');
    }

    pipeline.push(
        // Ahora sortField es 'acquisition.price', lo cual es válido para MongoDB
        { $sort: { [sortField]: -1 } },
        {
            $project: {
                _id: 0,
                name: 1,
                collectionName: '$template.name',
                value: valueField,
                date: dateField,
                image: { $arrayElemAt: ['$images', 0] }
            }
        }
    );

    const items = await Item.aggregate(pipeline);
    return items;
};

module.exports = { getDashboardStats, getMetricDetails };
