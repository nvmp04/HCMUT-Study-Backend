import { appointmentClient, tutorScheduleClient } from "../../config/db.js";
import { appointmentRepository } from "../appointment/apointment.repository.js";
import { scheduleRepository } from "./schedule.repository.js";
import {DateUtils, buildSlotsStatusHash} from "./schedule.until.js"

class ScheduleService{

    async getTutorSchedule(id){
        return await tutorScheduleClient.findOne({id});
    }
    
    async addSlot(tutorId, day, time) {
        if (!day || !time) {
            throw new Error('Missing required fields: day or time');
        }
        const doc = await scheduleRepository.getTimeSlot(tutorId);
        if (!doc) throw new Error('Tutor schedule not found');
        let times = doc[day] || [];
        if (times.includes(time)) {
            return { tutorId, day, times, message: "Slot already exists" };
        }
        times.push(time);
        times.sort((a, b) => {
            const hA = parseInt(a.split(":")[0]);
            const mA = parseInt(a.split(":")[1]);
            const hB = parseInt(b.split(":")[0]);
            const mB = parseInt(b.split(":")[1]);
            return (hA * 60 + mA) - (hB * 60 + mB);
        });
        await scheduleRepository.updateDaySchedule(tutorId, day, times);
        return { tutorId, day, times };
    }
    async deleteSlot(tutorId, day, time) {
        if (!day || !time) {
            throw new Error('Missing required fields: day or time');
        }
        const doc = await scheduleRepository.getTimeSlot(tutorId);
        if (!doc) throw new Error('Tutor schedule not found');

        let times = doc[day] || [];
        const newTimes = times.filter(t => t !== time);
        if (newTimes.length === times.length) {
            return { tutorId, day, times };
        }
        await scheduleRepository.updateDaySchedule(tutorId, day, newTimes);
        return { tutorId, day, times: newTimes };
    }

    async getRawData(tutorId) {
        // Gom các truy vấn DB về một đầu mối
        const [timeSlots, appointments] = await Promise.all([
            tutorScheduleClient.findOne({ id: tutorId }),
            appointmentClient.find({ tutorId: tutorId }).toArray()
        ]);
        return { timeSlots, appointments };
    }

    /**
     * Hàm này dùng để tạo lịch tuần hoàn cho 7 ngày tiếp theo (tính từ hôm nay)
     * Kết hợp logic "Bảng băm" để tối ưu hóa hiệu năng merge dữ liệu
     */
    async generate7daySchedule(tutorId) {
        const { timeSlots, appointments } = await this.getRawData(tutorId);
        
        // Khởi tạo bảng băm từ dữ liệu appointment thực tế
        const slotsStatus = buildSlotsStatusHash(appointments);
        const baseDate = new Date();
        baseDate.setHours(0, 0, 0, 0);
        return Array.from({ length: 7 }, (_, i) => {
            const today = new Date(baseDate);
            today.setDate(baseDate.getDate() + i);
            const index = today.getDay();
            const dateFormat = DateUtils.getDateFormat(today);
            const weekKey = DateUtils.getWeekKey(today);
            // Lấy các khung giờ mẫu từ Template tuần hoàn
            const templateSlots = timeSlots[weekKey] || [];
            const slotsWithStatus = templateSlots.map((slot) => {
                const booked = slotsStatus[dateFormat]?.[slot];
                if (booked) {
                    return {
                        time: slot, 
                        status: booked.status,
                        appointment: booked.appointment
                    };
                }
                return {
                    time: slot,
                    status: 'available'
                };
            });
            return {
                index,
                date: today,
                dayFormat: DateUtils.getDayFormat(today),
                dateFormat,
                timeSlots: slotsWithStatus
            };
        });
    }
}
export const scheduleService = new ScheduleService();