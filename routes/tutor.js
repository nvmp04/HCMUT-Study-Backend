import express from 'express';
import {   decline, acceptOrCancel} from '../controllers/tutorController.js';
const router = express.Router();



router.put('/response', acceptOrCancel);
router.delete('/decline', decline);

export default router;