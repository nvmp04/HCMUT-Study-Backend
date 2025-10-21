import { authService } from "../services/authService.js";
import { appointmentService } from "../services/appointmentService.js";
import { scheduleService } from "../services/scheduleService.js";
import { tutorService } from "../services/tutorService.js";
import { studentService } from "../services/studentService.js";
import { notificationService } from "../services/notificationService.js";
import { unsuccessfulService } from "../services/unsuccessfulService.js";
import { aiService } from "../services/aiService.js";
import { roadmapClient, tutorClient } from "../config/db.js";

/**
 * GET /student/tutors
 * Lấy danh sách tất cả tutors
 */
export async function getTutorsData(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const tutors = await tutorService.getAllTutors();
    return res.json({ tutors });
  } catch (err) {
    console.error("Error in getTutorsData:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /student/tutor
 * Lấy thông tin 1 tutor cụ thể
 */
export async function getTutorData(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.body;
    const tutor = await tutorService.getTutorById(id);
    res.json({ tutor });
  } catch (err) {
    console.error("Error in getTutorData:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * GET /student/data
 * Lấy thông tin student và appointments đã accepted
 */
export async function getStudentData(req, res) {
  try {
    const studentId = authService.authenticateRequest(req, res);
    if (!studentId) return;
    const result = await studentService.getStudentWithAppointments(studentId);
    res.json({
      student: result.student,
      appointment: result.appointments
    });
  } catch (err) {
    console.error("Error in getStudentData:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * POST /student/schedule
 * Lấy schedule của tutor và status của các slots
 */
export async function getSchedule(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.body;
    const schedule = await scheduleService.getTutorSchedule(id);
    const status = await appointmentService.getScheduleStatus(id);
    res.json({ schedule, status });
  } catch (err) {
    console.error("Error in getSchedule:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * POST /student/book
 * Book appointment với tutor
 */
export async function bookSession(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const appointmentData = req.body;
    const result = await appointmentService.bookAppointment(appointmentData);
    const io = req.app.get("io");
    if (io) {
      io.emit("booksession", {
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
    res.json({ success: true });
  } catch (err) {
    console.error("Error in bookSession:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * GET /student/my-schedule
 * Lấy tất cả appointments của student
 */
export async function getMySchedule(req, res) {
  try {
    const studentId = authService.authenticateRequest(req, res);
    if (!studentId) return;
    const appointments = await appointmentService.getAppointmentsByStudent(studentId);
    res.json({ appointment: appointments });
  } catch (err) {
    console.error("Error in getMySchedule:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * POST /student/cancel
 * Student cancel appointment (sau khi đã accepted)
 */
export async function cancelled(req, res) {
  try {
    const studentId = authService.authenticateRequest(req, res);
    if (!studentId) return;
    const { slotId, reason, _id } = req.body;
    console.log(slotId)
    const result = await appointmentService.cancelByStudent(studentId, _id, slotId, reason);
    await unsuccessfulService.addCancelSchedule(studentId, slotId, reason);
    const io = req.app.get("io");
    if (io) {
      io.emit("studentcancel", {
        id: studentId,
        tutorId: result.tutorId,
        name: result.appointment.studentName,
        slotId: slotId,
        type: "cancelled",
        reason: reason,
      });
      notificationService.emitNotification(io, result.tutorId);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error in cancelled:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * POST /student/cancel-before-accept
 * Student cancel appointment trước khi tutor accept (delete)
 */
export async function cancelBeforeAccept(req, res) {
  try {
    const studentId = authService.authenticateRequest(req, res);
    if (!studentId) return;

    const { _id, slotId } = req.body;
    const result = await appointmentService.cancelBeforeAccept(_id, studentId, slotId);
    const io = req.app.get("io");
    if (io) {
      io.emit("cancelbeforeaccept", {
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
/**
 * POST /student/delete-cancelled
 * Xóa appointment đã cancelled (cleanup)
 */
export async function deleteCancelled(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { _id } = req.body;
    await appointmentService.deleteCancelledAppointment(_id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error in deleteCancelled:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * POST /student/rating
 * Student đánh giá tutor sau appointment
 */
export async function rating(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { tutorId, rating: ratingValue, _id } = req.body;
    await appointmentService.rateAppointment(_id, ratingValue);
    const result = await tutorService.updateRating(tutorId, ratingValue);
    return res.status(200).json({
      message: "Rating updated successfully",
      data: result
    });
  } catch (err) {
    console.error("Error in rating:", err);
    
    if (err.message === 'Tutor not found') {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function AIgenerate(req, res){
  try{
    const id = authService.authenticateRequest(req, res);
    const {field, interests, level, goal, hoursPerWeek, subjectName} = req.body;
    console.log(subjectName);
    let roadmap;
    if(subjectName !== ''){
      roadmap = await aiService.generateSubjectRoadmap(subjectName, level, hoursPerWeek, goal);
    }
    else roadmap = await aiService.genarateRoadmap(field, interests, level, hoursPerWeek, goal);
    const roadmapJSON = await aiService.convertRoadmapToJSON(roadmap);
    let tutors = await aiService.findTutor(roadmap);
    roadmapJSON["id"] = id;
    if (typeof tutors === 'string') {
      try {
        tutors = JSON.parse(tutors);
      } catch (err) {
        console.error('Lỗi parse JSON từ AI:', err);
        tutors = [];
      }
    }
    roadmapJSON["tutors"] = tutors;
    await await roadmapClient.updateOne(
      { id },
      { $set: roadmapJSON },
      { upsert: true }
    );
    res.json({success: true});
  }
  catch(err){
    console.error("Error in generate:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getRoadmap(req, res){
  try{
    const id = authService.authenticateRequest(req, res);
    const roadmap = await roadmapClient.findOne({id});
    res.json({roadmap});
  }
  catch(err){
    console.error("Error in get roadmap:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSuitableTutors(req, res){
  try{
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {tutorsId} = req.body;
    const ids = tutorsId.map(item => item.id);

    const tutors = await tutorClient.find({ id: { $in: ids } }).toArray();
    res.json({tutors});
  }
  catch(err){
    console.error("Error in get suitable tutors:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}