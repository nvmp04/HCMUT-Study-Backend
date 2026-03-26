import { Router } from "express";
import { getAppointments } from "./appointment.controller.js";

const router = new Router();
router.get('/appointments', getAppointments);
export default router;