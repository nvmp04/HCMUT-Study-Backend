import express from 'express'
const router = express.Router();
import { checkAuth } from '../utils/checkAuth.js';
import multer from 'multer';
import { deleteDocument, getAllDocuments, getDocumentById, updateDocument, uploadDocument } from '../controllers/documentController.js';

const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/documents', getAllDocuments);
router.get('/documents/:id', getDocumentById);

// Protected routes - require authentication
router.post('/documents', upload.single('file'), uploadDocument);
router.put('/documents/:id', updateDocument);
router.delete('/documents/:id', deleteDocument);

export default router;