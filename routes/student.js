import express from 'express';
import { getStudentData, getTutorData, getTutorsData, getSchedule, bookSession } from '../controllers/studentController.js';
const router = express.Router();
router.get('/gettutorsdata', getTutorsData);
router.post('/gettutordata', getTutorData);
router.get('/getstudentdata', getStudentData);
router.post('/getschedule', getSchedule);
router.post('/booksession', bookSession)
export default router;