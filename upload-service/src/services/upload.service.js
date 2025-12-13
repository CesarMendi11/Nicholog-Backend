// Eliminamos: require('dotenv').config();
// Ya es cargado por server.js

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// 1. Configurar Cloudinary (Depende de server.js haber cargado el .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Definir dónde almacenará Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "nicholog_collections", 
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        public_id: (req, file) => `item-${Date.now()}` 
    }
});

const uploadMiddleware = multer({ storage: storage }).single('image');

// Utilidad para borrar imagen (Se usará después)
const extractPublicId = (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return null;
    const parts = imageUrl.split('/');
    const filenameWithExt = parts.pop();
    const publicId = path.parse(filenameWithExt).name; 
    return `${parts.pop()}/${publicId}`; 
};

// Utilidad para borrar imagen
const deleteImage = async (imageUrl) => {
    const publicId = extractPublicId(imageUrl);
    if (!publicId) return; 

    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`[CLOUD DELETE] Eliminado: ${publicId}`);
    } catch (error) {
        console.error(`[CLOUD DELETE ERROR] Falló eliminar ${publicId}:`, error);
    }
};

module.exports = { uploadMiddleware, deleteImage };