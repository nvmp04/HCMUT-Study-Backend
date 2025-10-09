import cron from "node-cron";
import { appointmentClient } from "../config/db.js";

function parseAppointmentDateTime(dateStr, timeStr) {
  const cleanDate = dateStr.split(", ")[1]; 
  const [startTime, endTime] = timeStr.split(" - "); 
  const [day, month, year] = cleanDate.split("/").map(Number);
  const [hour, minute] = endTime.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

export function initCronJobs() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    try {
      const appointments = await appointmentClient
        .find({ status: "accepted" })
        .toArray();
      for (const appt of appointments) {
        const endTime = parseAppointmentDateTime(appt.date, appt.time);
        if (endTime < now) {
          await appointmentClient.updateOne(
            { _id: appt._id },
            { $set: { status: "completed" } }
          );
        }
      }
      console.log("Cron: updated expired appointments");
    } catch (err) {
      console.error("Cron job error:", err);
    }
  });
}
