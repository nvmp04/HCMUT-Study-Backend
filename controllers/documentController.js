const documentService = require('../services/documentService');
const multer = require('multer');
const upload = multer();

class DocumentController {
    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const documentData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category
            };

            const document = await documentService.uploadDocument(
                req.file,
                documentData,
                req.user.id
            );

            res.status(201).json({
                success: true,
                document
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllDocuments(req, res) {
        try {
            const documents = await documentService.getAllDocuments();
            res.status(200).json({
                success: true,
                documents
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getDocumentById(req, res) {
        try {
            const document = await documentService.getDocumentById(req.params.id);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            res.status(200).json({
                success: true,
                document
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateDocument(req, res) {
        try {
            const document = await documentService.updateDocument(
                req.params.id,
                req.body
            );

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            res.status(200).json({
                success: true,
                document
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteDocument(req, res) {
        try {
            const document = await documentService.deleteDocument(req.params.id);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new DocumentController();