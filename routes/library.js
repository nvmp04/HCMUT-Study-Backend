const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { checkAuth } = require('../utils/checkAuth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/documents', documentController.getAllDocuments);
router.get('/documents/:id', documentController.getDocumentById);

// Protected routes - require authentication
router.use(checkAuth);
router.post('/documents', upload.single('file'), documentController.uploadDocument);
router.put('/documents/:id', documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);

module.exports = router;