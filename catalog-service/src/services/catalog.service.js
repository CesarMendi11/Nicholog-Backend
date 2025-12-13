const CollectionTemplate = require('../models/CollectionTemplate');
const Item = require('../models/Item');
const { createAuditLog } = require('./logger.service'); 

// NOTA MICROSERVICIOS: 
// Ya no importamos 'deleteImage' aquí porque el servicio de Upload está en otro servidor.
// En una fase avanzada, aquí haríamos una petición HTTP al servicio de Upload para borrar.

// ==========================================
// SECCIÓN 1: GESTIÓN DE COLECCIONES
// ==========================================

const createCollection = async (userId, data) => {
    const safeName = data.name ? data.name.trim() : "";
    if (!safeName) throw new Error("El nombre de la colección no puede estar vacío.");

    const exists = await CollectionTemplate.findOne({ 
        userId: userId, 
        name: { $regex: new RegExp(`^${safeName}$`, 'i') } 
    });

    if (exists) throw new Error(`Ya tienes una colección llamada '${safeName}'.`);

    try {
        const newCollection = await CollectionTemplate.create({
            ...data,
            name: safeName,
            userId: userId
        });

        await createAuditLog(
            userId,
            "CREATE_COLLECTION",
            `Se creó la nueva colección '${newCollection.name}'`,
            { type: "Collection", id: newCollection._id.toString(), name: newCollection.name },
            { old: null, new: newCollection }
        );

        return newCollection;
    } catch (error) {
        throw new Error("Error al crear colección: " + error.message);
    }
};

const getUserCollections = async (userId) => {
    return await CollectionTemplate.find({ userId: userId });
};

const updateCollection = async (userId, collectionId, updateData) => {
    if (updateData.name) {
        const safeName = updateData.name.trim();
        if (!safeName) throw new Error("El nombre no puede estar vacío.");
        
        const exists = await CollectionTemplate.findOne({
            userId: userId,
            name: { $regex: new RegExp(`^${safeName}$`, 'i') },
            _id: { $ne: collectionId } 
        });

        if (exists) throw new Error(`Ya tienes otra colección llamada '${safeName}'.`);
        updateData.name = safeName;
    }

    const collection = await CollectionTemplate.findOne({ _id: collectionId, userId: userId });
    
    if (!collection) throw new Error("Colección no encontrada o no tienes permiso.");

    const snapshotOld = JSON.parse(JSON.stringify(collection));

    Object.assign(collection, updateData);
    const updatedCollection = await collection.save();

    await createAuditLog(
        userId,
        "UPDATE_COLLECTION",
        `Se actualizó la configuración de la colección '${updatedCollection.name}'`,
        { type: "Collection", id: updatedCollection._id.toString(), name: updatedCollection.name },
        { old: snapshotOld, new: updatedCollection }
    );

    return updatedCollection;
};

const deleteCollection = async (userId, collectionId) => {
    const collectionToDelete = await CollectionTemplate.findOne({ 
        _id: collectionId, 
        userId: userId 
    });

    if (!collectionToDelete) throw new Error("Colección no encontrada o no tienes permiso.");

    await Item.deleteMany({ templateId: collectionId });
    await CollectionTemplate.deleteOne({ _id: collectionId });

    await createAuditLog(
        userId,
        "DELETE_COLLECTION",
        `Se eliminó la colección '${collectionToDelete.name}' y todo su contenido`,
        { type: "Collection", id: collectionId, name: collectionToDelete.name },
        { old: collectionToDelete, new: null }
    );

    return { message: "Colección y artículos eliminados." };
};

// ==========================================
// SECCIÓN 2: GESTIÓN DE ITEMS
// ==========================================

const createItem = async (userId, itemData) => {
    const safeName = itemData.name ? itemData.name.trim() : "";
    if (!safeName) throw new Error("El nombre del item no puede estar vacío.");
    itemData.name = safeName;

    const template = await CollectionTemplate.findOne({ 
        _id: itemData.templateId, 
        userId: userId 
    });

    if (!template) throw new Error("No tienes permiso para agregar items a esta colección.");

    const newItem = await Item.create(itemData);
    
    await createAuditLog(
        userId,
        "CREATE_ITEM",
        `Se agregó el item '${newItem.name}' a la colección`,
        { type: "Item", id: newItem._id.toString(), name: newItem.name },
        { old: null, new: newItem }
    );

    return newItem;
};

const getItemsByCollectionName = async (userId, collectionName) => {
    const template = await CollectionTemplate.findOne({ 
        userId: userId, 
        name: { $regex: new RegExp(`^${collectionName}$`, 'i') }
    });
    
    if (!template) throw new Error(`La colección '${collectionName}' no existe.`);

    return await Item.find({ templateId: template._id });
};

const searchItems = async (userId, queryText) => {
    const myTemplates = await CollectionTemplate.find({ userId: userId }).select('_id');
    const myTemplateIds = myTemplates.map(t => t._id);

    const items = await Item.find({
        templateId: { $in: myTemplateIds },
        name: { $regex: queryText, $options: 'i' }
    });

    return items;
};

const getItemById = async (userId, itemId) => {
    const item = await Item.findById(itemId);
    if (!item) throw new Error("Item no encontrado");

    const template = await CollectionTemplate.findOne({ _id: item.templateId, userId: userId });
    if (!template) throw new Error("No tienes permiso para ver este item");

    return item;
};

const updateItem = async (userId, itemId, updateData) => {
    if (updateData.name) {
        updateData.name = updateData.name.trim();
        if (!updateData.name) throw new Error("El nombre no puede estar vacío.");
    }

    const item = await Item.findById(itemId);
    if (!item) throw new Error("Item no encontrado.");

    const template = await CollectionTemplate.findOne({ _id: item.templateId, userId: userId });
    if (!template) throw new Error("Sin permiso.");

    const snapshotOld = JSON.parse(JSON.stringify(item));

    // [TODO] MICROSERVICIOS: Aquí deberíamos llamar al Upload Service para borrar imágenes viejas.
    // Por ahora, solo actualizamos la DB.

    Object.assign(item, updateData);
    await item.save();
    
    await createAuditLog(
        userId,
        "UPDATE_ITEM",
        `Se editaron datos del item '${item.name}'`,
        { type: "Item", id: item._id.toString(), name: item.name },
        { old: snapshotOld, new: item }
    );

    return item;
};

const deleteItem = async (userId, itemId) => {
    const item = await Item.findById(itemId);
    if (!item) throw new Error("Item no encontrado.");

    const template = await CollectionTemplate.findOne({ _id: item.templateId, userId: userId });
    if (!template) throw new Error("No tienes permiso para eliminar este item.");

    // [TODO] MICROSERVICIOS: Llamar al Upload Service para borrar imágenes.
    
    await Item.deleteOne({ _id: itemId });

    await createAuditLog(
        userId,
        "DELETE_ITEM",
        `Se eliminó el item '${item.name}' permanentemente`,
        { type: "Item", id: itemId, name: item.name },
        { old: item, new: null }
    );

    return { message: "Item eliminado." };
};

const filterItems = async (userId, collectionId, filters) => {
    const template = await CollectionTemplate.findOne({ _id: collectionId, userId: userId });
    if (!template) throw new Error("Colección no encontrada.");

    const query = { templateId: collectionId };

    for (const [key, value] of Object.entries(filters)) {
        if (typeof value === 'string') {
            query[`dynamicData.${key}`] = { $regex: new RegExp(`^${value}$`, 'i') };
        } else {
            query[`dynamicData.${key}`] = value;
        }
    }

    const items = await Item.find(query);
    return items;
};

module.exports = {
    createCollection, getUserCollections, updateCollection, deleteCollection,
    createItem, getItemsByCollectionName, searchItems, getItemById,
    updateItem, deleteItem, filterItems
};