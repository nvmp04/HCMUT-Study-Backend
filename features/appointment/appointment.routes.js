import { Router } from "express";
import { getAppointments, makeAppointment, reschedule } from "./appointment.controller.js";

const router = new Router();

router.get('/', getAppointments);
router.post('/', makeAppointment);
router.put('/', reschedule);

export default router;