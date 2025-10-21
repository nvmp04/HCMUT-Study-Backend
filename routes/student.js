import express from 'express';
import { getStudentData, getTutorData, getTutorsData, getSchedule, bookSession, getMySchedule, cancelled, cancelBeforeAccept, deleteCancelled, rating, AIgenerate, getRoadmap, getSuitableTutors} from '../controllers/studentController.js';

const router = express.Router();
router.get('/gettutorsdata', getTutorsData);
router.post('/gettutordata', getTutorData);
router.get('/getstudentdata', getStudentData);
router.post('/getschedule', getSchedule);
router.post('/booksession', bookSession);
router.get('/getmyschedule', getMySchedule);
router.put('/cancelled', cancelled);
router.delete('/cancelbeforeaccept', cancelBeforeAccept);
router.delete('/deletecancelled', deleteCancelled);
router.put('/rating', rating);
router.post('/ai', AIgenerate);
router.get('/getroadmap', getRoadmap);
router.post('/getsuitabletutors', getSuitableTutors);
export default router;