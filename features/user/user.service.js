import { userRepository } from "./user.repository.js";

class UserService{
    //Trả về thông tin của người dùng đang đăng nhập
    async getUserProfile(payload){
        const {sub} = payload;
        const user = await userRepository.getStudentProfile(sub);
        if(!user){
            const err = new Error('User not found!');
            err.status = 404;
            throw(err);
        }
        return user;
    }
    //Trả về thông tin của tutor bằng id
    async getTutorProfile(id){
        const tutor = await userRepository.getTutorProfile(id);
        if(!tutor){
            const err = new Error('Tutor not found!');
            err.status = 404;
            throw(err);
        }
        return tutor;
    }
    //Trả về danh sách tutor
    async getTutorList(){
        return await userRepository.getAllTutor();
    }
}
export const userSevice = new UserService();