import { Router } from "express";
import { cancel, deletePending, getAppointments, hideCancelled, makeAppointment, reschedule } from "./appointment.controller.js";

const router = new Router();

router.get('/', getAppointments);
router.post('/', makeAppointment);
router.put('/', reschedule);
router.delete('/', cancel);
router.delete('/pending', deletePending);
router.put('/history', hideCancelled);
export default router;