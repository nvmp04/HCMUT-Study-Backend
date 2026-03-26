import { tutorScheduleClient } from "../../config/db.js";

export class ScheduleRepository {

  async getTimeSlot(id){
    //Lấy các khung giờ rảnh của tutor(do tutor set)
    return await tutorScheduleClient.findOne({id});
  }

  async updateDaySchedule(tutorId, day, times) {
    return await tutorScheduleClient.updateOne(
      { id: tutorId },
      { $set: { [day]: times } }
    );
  }
}

export const scheduleRepository = new ScheduleRepository();