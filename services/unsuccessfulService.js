import { unsuccessfulRepository } from "../repositories/unsuccessfulRepository.js";

export class UnsuccessfulService {
  async getAllTutorUnsuccessfulSchedules() {
    return await unsuccessfulRepository.findAllTutor();
  }
  async getAllStudentUnsuccessfulSchedules() {
    return await unsuccessfulRepository.findAllStudent();
  }
  async addCancelSchedule(id, date, reason) {
    const schedule = { date, reason, createdAt: new Date() };
    return await unsuccessfulRepository.pushCancelSchedule(id, schedule);
  }

  async addDeclineSchedule(id, date, reason) {
    const schedule = { date, reason, createdAt: new Date() };
    return await unsuccessfulRepository.pushDeclineSchedule(id, schedule);
  }

  async removeCancelSchedule(id, scheduleId) {
    return await unsuccessfulRepository.deleteCancelSchedule(id, scheduleId);
  }

  async removeDeclineSchedule(id, scheduleId) {
    return await unsuccessfulRepository.deleteDeclineSchedule(id, scheduleId);
  }
}

export const unsuccessfulService = new UnsuccessfulService();
