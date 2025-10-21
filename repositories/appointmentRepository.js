import { appointmentClient } from "../config/db.js";
import { ObjectId } from "mongodb";
export class AppointmentRepository {
  async findByTutorId(tutorId, status = null) {
    const query = { tutorId };
    if (status) {
      query.status = status;
    }
    return await appointmentClient.find(query).sort({ time: -1 }).toArray();
  }
  async findByStudentId(studentId, status = null) {
    const query = { studentId };
    if (status) {
      query.status = status;
    }
    return await appointmentClient.find(query).sort({ time: -1 }).toArray();
  }

  async updateAppointment(_id, updateData) {
    return await appointmentClient.findOneAndUpdate(
      {
        _id: new ObjectId(_id)
      },
      { $set: updateData }
    );
  }

  async findById(appointmentId){
    return await appointmentClient.findOne({_id: appointmentId});
  }

  async create(appointmentData) {
    return await appointmentClient.insertOne(appointmentData);
  }
  async deleteById(appointmentId) {
    return await appointmentClient.findOneAndDelete({ _id: appointmentId });
  }
}
export const appointmentRepository = new AppointmentRepository();