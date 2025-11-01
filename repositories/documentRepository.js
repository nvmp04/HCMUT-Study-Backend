import { documentClient } from '../config/db.js';
import { ObjectId } from 'mongodb';

class DocumentRepository {
  async createDocument(documentData) {
    try {
      const newDocument = {
        ...documentData,
        uploadDate: new Date(),
      };
      const result = await documentClient.insertOne(newDocument);
      return { _id: result.insertedId, ...newDocument };
    } catch (error) {
      console.error('❌ [createDocument] Lỗi khi tạo document:', error);
      throw error;
    }
  }

  async getAllDocuments() {
    try {
      const documents = await documentClient
        .find({})
        .sort({ uploadDate: -1 })
        .toArray();
      return documents;
    } catch (error) {
      console.error('❌ [getAllDocuments] Lỗi khi lấy danh sách document:', error);
      throw error;
    }
  }

  async getDocumentById(id) {
    try {
      const document = await documentClient.findOne({ _id: new ObjectId(id) });
      return document;
    } catch (error) {
      console.error('❌ [getDocumentById] Lỗi khi lấy document ID=' + id, error);
      throw error;
    }
  }

  async updateDocument(id, updateData) {
    try {
      const result = await documentClient.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      return result.value;
    } catch (error) {
      console.error('❌ [updateDocument] Lỗi khi cập nhật document ID=' + id, error);
      throw error;
    }
  }

  async deleteDocument(id) {
    try {
      const result = await documentClient.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('❌ [deleteDocument] Lỗi khi xóa document ID=' + id, error);
      throw error;
    }
  }

  async getDocumentsByCategory(category) {
    try {
      const query = category === 'all' ? {} : { category };
      const documents = await documentClient
        .find(query)
        .sort({ uploadDate: -1 })
        .toArray();
      return documents;
    } catch (error) {
      console.error('❌ [getDocumentsByCategory] Lỗi khi lấy theo category:', error);
      throw error;
    }
  }
}

export const documentRepository = new DocumentRepository();
