import { authService } from "../../services/authService.js";
import { appointmentService } from "./appointment.service.js";

export async function getAppointments(req, res){
    try{
        const decoded = authService.authenticateRequest(req);
        const appointments = await appointmentService.getUserAppointments(decoded.id);
        if(!appointments){
            return res.status(404).json({error: 'Appointments not found!'})
        }
        res.json({appointments});
    }
    catch(err){
        const statusCode = err.status;
        res.status(statusCode).json({error: err.message})
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

