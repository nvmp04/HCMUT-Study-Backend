import { authService } from "../../services/authService.js";
import { userRepository } from "./user.repository.js";
import { userSevice } from "./user.service.js";

export async function getUserProfile(req, res){
    const decodedToken = authService.authenticateRequest(req);
    if (!decodedToken) {
        return res.status(401).json({ message: "Token Expired" });
    }
    try{
        const user = await userSevice.getUserProfile(decodedToken);
        res.status(200).json(user);
    }
    catch(err){
        const statusCode = err.status || 500;
        return res.status(statusCode).json({ 
            error: err.message || "Internal Server Error"
        });
    }
}

export async function getTutorProfile(req, res){
    try{
        const { id } = req.params;
        const tutor = await userRepository.getTutorProfile(id);
        res.status(200).json(tutor);
    }
    catch(err){
        const statusCode = err.status || 500;
        return res.status(statusCode).json({
            err: err.message || 'Internal Sever Error'
        })
    }
}

export async function getTutorList(req, res){
    try{
        const tutors = await userSevice.getTutorList();
        res.status(200).json({tutors});
    }
    catch(err){
        const statusCode = err.status;
        res.status(statusCode).json({err: err.message})
    }
}