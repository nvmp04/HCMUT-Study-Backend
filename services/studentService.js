import { studentRepository } from "../repositories/studentRepository.js";
import { appointmentService } from "./appointmentService.js";

export class StudentService {
  /**
   * Get student data with accepted appointments
   */
  async getAllstudents(){
   return await studentRepository.findAll();
  }
  async getBannedStudent(){
    return await studentRepository.findBanned();
  }
  async getStudentWithAppointments(studentId) {
    const student = await studentRepository.findById(studentId);
    const appointments = await appointmentService.getAppointmentsByTutor(studentId, 'accepted');

    return {
      student,
      appointments
    };
  }
  async updateBanStatus(id, status){
    return await studentRepository.updateBanStatus(id, status);
  }
}

export const studentService = new StudentService();