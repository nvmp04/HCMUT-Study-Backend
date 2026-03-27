import { authService } from "../auth/auth.service.js";
import { scheduleService } from "./schedule.service.js";
import { appointmentService } from "../appointment/appointment.service.js";
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
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Tutor ID is required' });

    const schedule = await scheduleService.getTutorSchedule(id);
    const status = await appointmentService.getScheduleStatus(id);
    res.json({ schedule, status });
  } catch (err) {
    console.error("Error in getSchedule:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}