import { documentRepository } from '../repositories/documentRepository.js';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import path from 'path';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function sanitizeFileName(filename) {
    const nameWithoutExt = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const sanitized = nameWithoutExt
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_') 
        .toLowerCase();
    
    return sanitized + ext;
}

class DocumentService {
    async uploadDocument(file, documentData, userId) {
        try {
            const sanitizedName = sanitizeFileName(file.originalname);
            const publicId = `${Date.now()}_${sanitizedName}`;

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'auto', 
                        folder: 'documents',
                        public_id: publicId, 
                        access_mode: 'public', 
                        type: 'upload',
                        invalidate: true, 
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                const stream = Readable.from(file.buffer);
                stream.pipe(uploadStream);
            });

            const document = await documentRepository.createDocument({
                ...documentData,
                fileUrl: result.secure_url, 
                fileName: file.originalname, 
                fileSize: result.bytes,
                fileType: result.format,
                publicId: result.public_id, 
                uploadedBy: userId
            });

            return document;
        } catch (error) {
            console.error('Upload error:', error);
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

            const publicId = document.publicId || this.extractPublicId(document.fileUrl);
            
            const resourceType = this.getResourceType(document.fileUrl, document.fileType);

            await cloudinary.uploader.destroy(publicId, { 
                resource_type: resourceType,
                invalidate: true 
            });

            return await documentRepository.deleteDocument(id);
        } catch (error) {
            console.error('Delete error:', error);
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

    extractPublicId(url) {
        try {
            const parts = url.split('/upload/');
            if (parts.length < 2) return null;
            
            const pathWithExt = parts[1].split('/').slice(1).join('/'); 
            const publicId = pathWithExt.substring(0, pathWithExt.lastIndexOf('.')); // Bỏ extension
            
            return publicId;
        } catch (error) {
            console.error('Error extracting public_id:', error);
            return null;
        }
    }

    getResourceType(url, fileType) {
        if (url.includes('/image/')) return 'image';
        if (url.includes('/video/')) return 'video';
        if (url.includes('/raw/')) return 'raw';
        
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const videoExts = ['mp4', 'mov', 'avi', 'webm'];
        
        if (fileType && imageExts.includes(fileType.toLowerCase())) return 'image';
        if (fileType && videoExts.includes(fileType.toLowerCase())) return 'video';
        
        return 'raw'; 
    }
}

export const documentService = new DocumentService();