import cron from "node-cron";
import { appointmentClient, unsuccessfulClient, historyClient } from "../config/db.js"; 
import { notificationService } from "../services/notificationService.js";

function parseAppointmentDateTime(dateStr, timeStr, mode = "end") {
  const [startStr, endStr] = timeStr.split(" - ");
  const [day, month, year] = dateStr.split("/").map(Number);
  const [hour, minute] = (mode === "start" ? startStr : endStr)
    .split(":")
    .map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

/**
 * Khởi tạo cron job
 */
export function initCronJobs(io) {
  /**
   *  Cron 1: Kiểm tra lịch hẹn mỗi phút
   */
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      const appointments = await appointmentClient
        .find({ status: { $in: ["accepted", "pending"] } })
        .toArray();
      if (!appointments.length) return;

      for (const appt of appointments) {
        const mode = appt.status === "accepted" ? "end" : "start";
        const compareTime = parseAppointmentDateTime(appt.date, appt.time, mode);

        if (compareTime < now) {
          if (appt.status === "accepted") {
            const historyData = {
                ...appt,
                status: "completed", 
                visibleToStudent: true,
                visibleToTutor: true,
                archivedAt: new Date(),
                completedAt: new Date()
            };
            delete historyData._id;
            await historyClient.insertOne(historyData);
            await appointmentClient.deleteOne({ _id: appt._id });
          } else {
            await appointmentClient.deleteOne({ _id: appt._id });

            const message = `Yêu cầu lịch học vào lúc ${appt.time} ngày ${appt.date} đã bị xóa do quá thời gian.`;

            await notificationService.createNotification(
              appt.studentId,
              "Thông báo lịch học",
              message
            );
            if (io) {
              notificationService.emitNotification(io, appt.studentId);
            }
          }
        }
      }
    } catch (err) {
      console.error("Cron job error:", err);
    }
  });

  /**
   * Cron 2: Reset cancelSchedule và declineSchedule mỗi Chủ nhật 23:59
   */
  cron.schedule("59 23 * * 0", async () => {
    try {
      await unsuccessfulClient.updateMany(
        {},
        { $set: { cancelSchedule: [], declineSchedule: [] } }
      );

      console.log(" Reset lịch(hủy, từ chối) trong tuần!");
    } catch (err) {
      console.error("Lỗi khi reset lịch:", err);
    }
  });
}
