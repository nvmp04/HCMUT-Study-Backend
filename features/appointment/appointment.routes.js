import { Router } from "express";
import { getAppointments, makeAppointment } from "./appointment.controller.js";

const router = new Router();

router.get('/', getAppointments);
router.post('/', makeAppointment);

export default router;