import { studentClient } from "../config/db.js";

export class StudentRepository {
  async findById(studentId) {
    return await studentClient.findOne({ id: studentId });
  }

  async findAll() {
    return await studentClient.find({}).toArray();
  }

  async findBanned(){
    return await studentClient.find({banned: true}).toArray();
  }

  async updateBanStatus(id, status){
    return await studentClient.updateOne(
      { id },
      { $set: {banned: status} }
    );
  }
}

export const studentRepository = new StudentRepository();