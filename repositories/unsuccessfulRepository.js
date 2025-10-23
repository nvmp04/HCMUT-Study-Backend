import { unsuccessfulClient } from "../config/db.js";

export class UnsuccessfulRepository {
  async findAllTutor() {
    return await unsuccessfulClient.find({role: 'tutor'}).toArray();
  }
  async findAllStudent() {
    return await unsuccessfulClient.find({role: 'student'}).toArray();
  }
  async pushCancelSchedule(id, role, schedule) {
    return await unsuccessfulClient.updateOne(
      { id },
      { $push: { cancelSchedule: schedule }, 
        $set: {role}
      },
      { upsert: true }
    );
  }

  async pushDeclineSchedule(id, schedule) {
    return await unsuccessfulClient.updateOne(
      { id },
      {
        $push: { declineSchedule: schedule },
        $set: { role: 'tutor' }
      },
      { upsert: true }
    );
  }


  async deleteCancelSchedule(id, scheduleId) {
    return await unsuccessfulClient.updateOne(
      { id },
      { $pull: { cancelSchedule: { _id: scheduleId } } }
    );
  }

  async deleteDeclineSchedule(id, scheduleId) {
    return await unsuccessfulClient.updateOne(
      { id },
      { $pull: { declineSchedule: { _id: scheduleId } } }
    );
  }
}

export const unsuccessfulRepository = new UnsuccessfulRepository();
