import { appointmentClient } from "../../config/db.js";
import { ObjectId } from "mongodb";
export class AppointmentRepository {
    async findByUserId(id){
        const query = {
            $or: [
                {studentId: id}, 
                {tutorId: id}
            ]
        }
        return await appointmentClient.find(query).sort({time: -1}).toArray();
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
    async checkConflictSlot(tutorId, time, date){
        const conflictSlot = await appointmentClient.findOne({tutorId, date, time});
        if(conflictSlot) return true;
        return false;
    }
}
export const appointmentRepository = new AppointmentRepository();