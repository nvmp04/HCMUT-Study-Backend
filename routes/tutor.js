import express from 'express';
import {   decline, acceptOrCancel, reportAppointment } from '../controllers/tutorController.js';
const router = express.Router();



router.put('/response', acceptOrCancel);
router.delete('/decline', decline);
router.put('/report', reportAppointment);
export default router;