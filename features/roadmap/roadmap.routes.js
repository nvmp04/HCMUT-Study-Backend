import { Router } from "express";
import { AIgenerate, getRoadmap, getSuitableTutors } from "./roadmap.controller.js";
const router = Router();

router.post('/', AIgenerate);
router.get('/', getRoadmap);
router.post('/suitable-tutors', getSuitableTutors);

export default router;
