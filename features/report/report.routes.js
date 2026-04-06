import { Router } from "express";
import { reportAppointment } from "./report.controller.js";
const router = Router();

router.put('/', reportAppointment);

export default router;