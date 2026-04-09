import { authService } from "../auth/auth.service.js";
import { scheduleService } from "./schedule.service.js";
/**
 * POST /schedule/tutor-schedule
 * Lấy tất cả lịch trình của tutor là các khung giờ(slot) và trạng thái của chúng(status)
 */
export async function getTutorSchedule(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const tutorId = req.params.id || token.id;
    if (!tutorId) {
      return res.status(400).json({ error: 'Tutor ID is required' });
    }
    const schedule = await scheduleService.generate7daySchedule(tutorId);
    return res.json(schedule);
  } catch (err) {
    console.error("Error in getSchedule:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function addSlot(req, res) {
  try {
    const payload = authService.authenticateRequest(req, res);
    const {id} = payload;
    if (!id) return;
    const { day, time } = req.body;
    const result = await scheduleService.addSlot(id, day, time, 'add');
    const io = req.app.get("io");
    if (io) {
      io.emit("tutorScheduleUpdated", { id, day, action: 'add', result });
    }
    res.status(201).json({ success: true, message: "Slot added successfully", times: result.times });
  } catch (err) {
    
    console.error("Error in add slot:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteSlot(req, res) {
  try {
    const id = authService.authenticateRequest(req, res).id;
    if (!id) return;
    const { day, time } = req.body;
    const result = await scheduleService.deleteSlot(id, day, time, 'delete');

    const io = req.app.get("io");
    if (io) {
      io.emit("tutorScheduleUpdated", { id, day, action: 'delete', result });
    }
    res.json({ success: true, message: "Slot deleted successfully", times: result.times });
  } catch (err) {
    console.error("Error in delete slot:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}