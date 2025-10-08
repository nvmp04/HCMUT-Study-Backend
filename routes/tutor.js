import express from 'express';
import { getSchedule, getTutorData, addDeleteSlot, response, decline } from '../controllers/tutorController.js';
const router = express.Router();
router.get('/gettutordata', getTutorData);
router.get('/getschedule', getSchedule);
router.put('/adddeleteslot', addDeleteSlot);
router.put('/response', response);
router.delete('/decline', decline);
export default router;