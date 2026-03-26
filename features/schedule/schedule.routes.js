import { Router } from "express";
import { getTutorSchedule } from "./schedule.controller.js"

const router = Router();
router.get('/tutor-schedule/:id', getTutorSchedule);
export default router;