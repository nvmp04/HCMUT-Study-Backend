import { Router } from "express";
import { reject, deletePending, getAppointments, hideCancelled, makeAppointment, reschedule, accept } from "./appointment.controller.js";

const router = new Router();

router.get('/', getAppointments);
router.post('/', makeAppointment);
router.put('/', reschedule);
router.patch('/', accept);
router.delete('/', reject);
router.delete('/pending', deletePending);
router.put('/history', hideCancelled);
export default router;