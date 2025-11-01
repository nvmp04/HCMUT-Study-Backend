const documentRepository = require('../repositories/documentRepository');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Cấu hình Cloudinary (thêm vào config/cloudinary.js sau)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class DocumentService {
    async uploadDocument(file, documentData, userId) {
        try {
            // Upload file to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'raw',
                        folder: 'documents',
                        public_id: `${Date.now()}-${file.originalname}`
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                const stream = Readable.from(file.buffer);
                stream.pipe(uploadStream);
            });

            // Create document record
            const document = await documentRepository.createDocument({
                ...documentData,
                fileUrl: result.secure_url,
                fileName: file.originalname,
                uploadedBy: userId
            });

            return document;
        } catch (error) {
            throw error;
        }
    }

    async getAllDocuments() {
        try {
            return await documentRepository.getAllDocuments();
        } catch (error) {
            throw error;
        }
    }

    async getDocumentById(id) {
        try {
            return await documentRepository.getDocumentById(id);
        } catch (error) {
            throw error;
        }
    }

    async updateDocument(id, updateData) {
        try {
            return await documentRepository.updateDocument(id, updateData);
        } catch (error) {
            throw error;
        }
    }

    async deleteDocument(id) {
        try {
            const document = await documentRepository.getDocumentById(id);
            if (!document) {
                throw new Error('Document not found');
            }

            // Delete file from Cloudinary
            const publicId = document.fileUrl.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

            // Delete document record
            return await documentRepository.deleteDocument(id);
        } catch (error) {
            throw error;
        }
    }

    async getDocumentsByCategory(category) {
        try {
            return await documentRepository.getDocumentsByCategory(category);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new DocumentService();