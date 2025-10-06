import express from 'express';
import { getTutorData } from '../controllers/tutorController.js';
const router = express.Router();
router.get('/gettutordata', getTutorData);
export default router;