import { studentRepository } from "../repositories/studentRepository.js";

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
  async getStudentProfile(studentId) {
    const student = await studentRepository.findById(studentId);
    return student;
  }
  async updateBanStatus(id, status){
    return await studentRepository.updateBanStatus(id, status);
  }
}

export const studentService = new StudentService();