import { documentService } from '../services/documentService.js';
import { authService } from '../services/authService.js';
import multer from 'multer';
const upload = multer();

export async function uploadDocument(req, res) {
  try {
    const id = authService.authenticateRequest(req, res);
    if (!id) return;
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
      id
    );
    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('❌ [uploadDocument] Lỗi khi upload tài liệu:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getAllDocuments(req, res) {
  try {
    const documents = await documentService.getAllDocuments();
    res.status(200).json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('❌ [getAllDocuments] Lỗi khi lấy danh sách tài liệu:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function getDocumentById(req, res) {
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
    console.error(`❌ [getDocumentById] Lỗi khi lấy document ID=${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function updateDocument(req, res) {
  try {
    const document = await documentService.updateDocument(req.params.id, req.body);

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
    console.error(`❌ [updateDocument] Lỗi khi cập nhật document ID=${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function deleteDocument(req, res) {
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
    console.error(`❌ [deleteDocument] Lỗi khi xóa document ID=${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
