const Document = require('../models/document');

class DocumentRepository {
    async createDocument(documentData) {
        try {
            const document = new Document(documentData);
            return await document.save();
        } catch (error) {
            throw error;
        }
    }

    async getAllDocuments() {
        try {
            return await Document.find()
                .populate('uploadedBy', 'name email')
                .sort({ uploadDate: -1 });
        } catch (error) {
            throw error;
        }
    }

    async getDocumentById(id) {
        try {
            return await Document.findById(id)
                .populate('uploadedBy', 'name email');
        } catch (error) {
            throw error;
        }
    }

    async updateDocument(id, updateData) {
        try {
            return await Document.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }

    async deleteDocument(id) {
        try {
            return await Document.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }

    async getDocumentsByCategory(category) {
        try {
            return await Document.find({ category })
                .populate('uploadedBy', 'name email')
                .sort({ uploadDate: -1 });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new DocumentRepository();