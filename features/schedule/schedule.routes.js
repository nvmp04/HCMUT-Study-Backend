import { Router } from "express";
import { addSlot, deleteSlot, getTutorSchedule } from "./schedule.controller.js"

const router = Router();

router.get('/tutor-schedule/:id', getTutorSchedule);
router.put('/slot', addSlot);
router.delete('/slot', deleteSlot);

export default router;