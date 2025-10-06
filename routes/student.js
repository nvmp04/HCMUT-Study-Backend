import express from 'express';
import { getStudentData, getTutorData, getTutorsData } from '../controllers/studentController.js';
const router = express.Router();
router.get('/gettutorsdata', getTutorsData);
router.post('/gettutordata', getTutorData);
router.get('/getstudentdata', getStudentData);
export default router;