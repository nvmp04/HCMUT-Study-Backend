import { studentClient, tutorClient } from "../../config/db.js";

class UserRepository{
    async getStudentProfile(id){
        return await studentClient.findOne({id});
    }
    async getTutorProfile(id){
        return await tutorClient.findOne({id});
    }
    async getAllTutor(){
        return await tutorClient.find().toArray();
    }
}
export const userRepository = new UserRepository();