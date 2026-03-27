import express from 'express';
import {  cancelled, cancelBeforeAccept, deleteCancelled, rating, AIgenerate, getRoadmap, getSuitableTutors} from '../controllers/studentController.js';

const router = express.Router();


router.put('/cancelled', cancelled);
router.delete('/cancelbeforeaccept', cancelBeforeAccept);
router.delete('/deletecancelled', deleteCancelled);
router.put('/rating', rating);
router.post('/ai', AIgenerate);
router.get('/getroadmap', getRoadmap);
router.post('/getsuitabletutors', getSuitableTutors);
export default router;