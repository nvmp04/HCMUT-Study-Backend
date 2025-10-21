import { tutorScheduleClient } from "../config/db.js";

export class ScheduleRepository {
  async findByTutorId(tutorId) {
    return await tutorScheduleClient.findOne({ id: tutorId });
  }

  async updateDaySchedule(tutorId, day, times) {
    return await tutorScheduleClient.updateOne(
      { id: tutorId },
      { $set: { [day]: times } }
    );
  }
}

export const scheduleRepository = new ScheduleRepository();