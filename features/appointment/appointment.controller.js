import { authService } from "../auth/auth.service.js";
import { appointmentService } from "./appointment.service.js";
import { notificationService } from "../../services/notificationService.js";

export async function getAppointments(req, res) {
    try {
        const payload = authService.authenticateRequest(req);
        if (!payload) return res.status(401).json({ error: 'Unauthorized' });
        const { active, history } = await appointmentService.getUserFullSchedule(payload.sub, payload.currentRole);
        res.json({ active, history });
    } catch (err) {
        console.error("Error in getAppointments:", err);
        const statusCode = err.status || 500;
        res.status(statusCode).json({ error: err.message || 'Internal server error' });
    }
}

export async function makeAppointment(req, res){
    try{
        const token = authService.verifyToken(req);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const appointmentData = req.body;
        const result = await appointmentService.bookAppointment(appointmentData);
        const io = req.app.get("io");
        if (io) {
            io.to(result.tutorId).emit("booksession", {
            tutorId: result.tutorId,
            slotId: appointmentData.slotId,
            date: appointmentData.date,
            time: appointmentData.time,
            title: appointmentData.title,
            reason: appointmentData.reason,
            name: appointmentData.studentName,
            type: "booked",
            });
            notificationService.emitNotification(io, result.tutorId);
        }
        res.json({ success: true, data: result });
    }
    catch(err){;
        res.status( err?.status || 500).json({error: err?.message || "Internal server error"})
    }
}

export async function reschedule(req, res){
    try{
        const {appointment, timeSlot} = req.body;
        const result = await appointmentService.reschedule(appointment, timeSlot);
        res.json(result);
    }
    catch(err){
        const statusCode = err.status;
        res.status(statusCode || 500).json({error: err.message || 'Internal server error'})
    }
}

export async function accept(req, res) {
  try {
    const payload = authService.authenticateRequest(req, res);
    const tutorId = payload.sub;
    if (!tutorId) return;
    const { _id, slotId, type, detail } = req.body;
    let result;
    result = await appointmentService.acceptAppointment(tutorId, _id, slotId, type, detail);

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

      io.to(result.studentId).emit("appointment-updated", eventData);
      notificationService.emitNotification(io, result.studentId);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in accept:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function reject(req, res) {
  try {
    const userData = authService.authenticateRequest(req, res); 
    if (!userData) return;

    const { id, role } = userData; 
    const { _id, reason } = req.body;
    console.log(req.body)
    const {action} = req.query;
    const result = await appointmentService.rejectAndArchive(
      _id, 
      id, 
      role, 
      reason,
      action
    );
    const io = req.app.get("io");
    if (io) {
      const targetId = role === 'student' ? result.tutorId : result.studentId;
      io.to(targetId).emit("appointmentCancelled", {
        by: role,
        name: role === 'student' ? result.appointment.studentName : result.appointment.tutorName,
        reason: reason,
        appointmentId: _id
      });
      notificationService.emitNotification(io, targetId);
    }

    res.json({ success: true, message: "Đã hủy và lưu vào lịch sử" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function hideCancelled(req, res) {
    try {
        const payload = authService.authenticateRequest(req); 
        const { _id} = req.body;

        if (!_id) {
            return res.status(400).json({ error: "Thiếu ID lịch học." });
        }
        await appointmentService.hideHistory(_id, payload.currentRole);
        
        res.json({ success: true, message: "Đã ẩn lịch khỏi danh sách của bạn." });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

export async function deletePending(req, res){
    try {
    const studentId = authService.authenticateRequest(req, res).id;
    if (!studentId) return;

    const { _id, slotId } = req.body;
    const result = await appointmentService.cancelBeforeAccept(_id, studentId, slotId);
    const io = req.app.get("io");
    if (io) {
      io.to(result.tutorId).emit("cancelbeforeaccept", {
        slotId: slotId,
        studentId: studentId,
        tutorId: result.tutorId,
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error in cancelBeforeAccept:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}