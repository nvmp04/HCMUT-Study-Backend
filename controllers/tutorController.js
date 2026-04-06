import { authService } from "../features/auth/auth.service.js";
import { appointmentService } from "../features/appointment/appointment.service.js";
import { notificationService } from "../services/notificationService.js";
import { tutorRepository } from "../repositories/tutorRepository.js";
import { unsuccessfulService } from "../services/unsuccessfulService.js";

/**
 * GET /tutor/data
 * Lấy thông tin tutor và appointments đã accepted
 */
export async function getTutorData(req, res) {
  try {
    const tutorId = authService.authenticateRequest(req, res);
    if (!tutorId) return; 
    const tutor = await tutorRepository.findById(tutorId);
    const appointment = await appointmentService.getAppointmentsByTutor(tutorId, 'accepted');

    res.json({ tutor, appointment });
  } catch (err) {
    console.error("❌ Error in getTutorData:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}




/**
 * POST /tutor/appointment/accept-or-cancel
 * Accept hoặc cancel appointment
 */
export async function acceptOrCancel(req, res) {
  try {
    // Authenticate
    const tutorId = authService.authenticateRequest(req, res);
    if (!tutorId) return;

    const { _id, slotId, type, detail, reason } = req.body;
    let result;

    if (!reason) {
      // Accept appointment
      result = await appointmentService.acceptAppointment(tutorId, _id, slotId, type, detail);
    } else {
      // Cancel appointment
      result = await appointmentService.cancelAppointment(tutorId, _id, slotId, reason);
      await unsuccessfulService.addCancelSchedule(tutorId, 'tutor', slotId, reason);
    }

    // Emit socket events
    const io = req.app.get("io");
    if (io) {
      // Emit appointment update
      const eventData = {
        _id,
        id: tutorId,
        studentId: result.studentId,
        title: result.appointment.title,
        tutorId: tutorId,
        name: result.appointment.tutorName,
        slotId: slotId,
        type: result.eventType
      };

      if (reason) {
        eventData.reason = reason;
      }

      io.to(result.studentId).emit("appointment-updated", eventData);
      notificationService.emitNotification(io, result.studentId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in acceptOrCancel:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /tutor/appointment/decline
 * Decline (delete) appointment
 */
export async function decline(req, res) {
  try {
    // Authenticate
    const tutorId = authService.authenticateRequest(req, res);
    if (!tutorId) return;

    const { _id, reason} = req.body;
    const result = await appointmentService.declineAppointment(_id, tutorId, reason);
    await unsuccessfulService.addDeclineSchedule(tutorId, reason);
    const io = req.app.get("io");
    if (io) {
      io.to(result.studentId).emit("decline", {
        _id,
        tutorId: tutorId,
        title: result.appointment.title,
        name: result.appointment.tutorName,
        slotId: slotId,
        studentId: result.studentId,
        type: 'declined',
        reason
      });
      notificationService.emitNotification(io, result.studentId);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in decline:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
