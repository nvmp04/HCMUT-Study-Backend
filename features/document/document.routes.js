import express from 'express'
const router = express.Router();
import multer from 'multer';
import { deleteDocument, getAllDocuments, getDocumentById, updateDocument, uploadDocument } from './document.controller.js'

const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);

// Protected routes - require authentication
router.post('/', upload.single('file'), uploadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;