import { authService } from "../services/authService.js";
import { appointmentService } from "../services/appointmentService.js";
import { scheduleService } from "../services/scheduleService.js";
import { notificationService } from "../services/notificationService.js";
import { tutorRepository } from "../repositories/tutorRepository.js";
import { unsuccessfulService } from "../services/unsuccessfulService.js";
import { reportService } from "../services/reportService.js";

/**
 * GET /tutor/data
 * Lấy thông tin tutor và appointments đã accepted
 */
export async function getTutorData(req, res) {
  try {
    const tutorId = authService.authenticateRequest(req, res);
    console.log(tutorId)
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
 * GET /tutor/schedule
 * Lấy schedule và tất cả appointments của tutor
 */
export async function getSchedule(req, res) {
  try {
    // Authenticate
    const tutorId = authService.authenticateRequest(req, res);
    if (!tutorId) return;

    // Get data
    const schedule = await scheduleService.getTutorSchedule(tutorId);
    const appointment = await appointmentService.getAppointmentsByTutor(tutorId);

    res.json({ schedule, appointment });
  } catch (err) {
    console.error("❌ Error in getSchedule:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /tutor/schedule/slot
 * Thêm hoặc xóa slot trong schedule
 */
export async function addDeleteSlot(req, res) {
  try {
    const tutorId = authService.authenticateRequest(req, res);
    if (!tutorId) return;

    const { day, time, type } = req.body;

    // Business logic
    const result = await scheduleService.addOrDeleteSlot(tutorId, day, time, type);

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("tutorScheduleUpdated", result);
    }

    res.json({ success: true, times: result.times });
  } catch (error) {
    console.error("❌ Error in addDeleteSlot:", error);
    
    // Handle specific errors
    if (error.message.includes('Missing required fields')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Invalid type')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Internal server error", details: error.message });
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
      await unsuccessfulService.addCancelSchedule(tutorId, slotId, reason);
    }

    // Emit socket events
    const io = req.app.get("io");
    if (io) {
      // Emit appointment update
      const eventData = {
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

      io.emit("appointment-updated", eventData);
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

    const { _id, reason, slotId } = req.body;
    const result = await appointmentService.declineAppointment(_id, tutorId, slotId, reason);
    await unsuccessfulService.addDeclineSchedule(tutorId, slotId, reason);
    const io = req.app.get("io");
    if (io) {
      io.emit("decline", {
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
export async function getAppointments(req, res){
  try{
    const tutorId = authService.authenticateRequest(req, res);
    if(!tutorId) return;
    const appointments = await appointmentService.getAppointmentsByTutor(tutorId);
    res.json({ appointment: appointments });
  }
  catch(err){
    console.error("❌ Error in get appointments:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
export async function reportAppointment(req, res){
  try{
    const tutorId = authService.authenticateRequest(req, res);
    if(!tutorId) return;
    const { report } = req.body;
    const result = await appointmentService.reportAppointment(report.sessionId, report);
    const {studentId, tutorName, title, slotId} = result;
    await reportService.createReport(studentId, tutorName, title, slotId, report);
    const io = req.app.get("io");
    if (io) {
      notificationService.emitNotification(io, studentId);
    }
    res.json({success: true})
  }
  catch(err){
    console.error("❌ Error in report appointments:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}