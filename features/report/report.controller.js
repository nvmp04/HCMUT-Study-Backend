import { notificationService } from "../../services/notificationService.js";
import { appointmentService } from "../appointment/appointment.service.js";
import { authService } from "../auth/auth.service.js";
import { reportService } from "./report.service.js";

export async function reportAppointment(req, res){
  try{
    const tutorId = authService.authenticateRequest(req, res).id;
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