import { tutorScheduleClient } from "../../config/db.js";
import { appointmentRepository } from "../appointment/apointment.repository.js";
import { scheduleRepository } from "./schedule.repository.js";

class ScheduleService{

    async getTutorSchedule(id){
        return await tutorScheduleClient.findOne({id});
    }
    /**
     * Lấy tất cả lịch trình của tutor là các khung giờ(slot) và trạng thái của chúng(status)
   */
    async getTutorWeeklySchedule(id){
        const slot = await scheduleRepository.getTimeSlot();
        const appt = await appointmentRepository.findByUserId(id);
        
    }
    /**
   * Thêm hoặc xóa slot trong schedule
   */
    async addOrDeleteSlot(tutorId, day, time, type) {
        // Validation
        if (!day || !time || !type) {
        throw new Error('Missing required fields: day, time, or type');
        }

        if (!['add', 'delete'].includes(type)) {
        throw new Error('Invalid type (must be add or delete)');
        }

        // Get current schedule
        const doc = await scheduleRepository.findByTutorId(tutorId);
        if (!doc) {
        throw new Error('Tutor schedule not found');
        }

        let times = doc[day] || [];

        if (type === 'add') {
        // Add slot if not exists
        if (!times.includes(time)) {
            times.push(time);
        }

        // Sort times
        times.sort((a, b) => {
            const [startA] = a.split(" - ");
            const [startB] = b.split(" - ");
            const [hA, mA] = startA.split(":").map(Number);
            const [hB, mB] = startB.split(":").map(Number);
            return hA * 60 + mA - (hB * 60 + mB);
        });
        } else if (type === 'delete') {
        // Remove slot
        times = times.filter(t => t !== time);
        }

        // Update database
        await scheduleRepository.updateDaySchedule(tutorId, day, times);

        return {
        tutorId,
        day,
        times
        };
    }
}
export const scheduleService = new ScheduleService();