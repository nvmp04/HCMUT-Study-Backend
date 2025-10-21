import { reportClient } from "../config/db.js";
import { accountService } from "../services/accountService.js";
import { authService } from "../services/authService.js";
import { emailService } from "../services/emailService.js";
import { notificationService } from "../services/notificationService.js";
import { studentService } from "../services/studentService.js";
import { tutorService } from "../services/tutorService.js";
import { unsuccessfulService } from "../services/unsuccessfulService.js";

export async function getTutors(req, res){
    try {
        const token = authService.verifyToken(req);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const tutors = await tutorService.getAllTutors();
        const unsuccessfulSchedules = await unsuccessfulService.getAllTutorUnsuccessfulSchedules();
        return res.json({ tutors, unsuccessfulSchedules });
    } 
    catch (err) {
        console.error("Error in getTutorData:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getStudents(req, res){
    try{
        const token = authService.verifyToken(req);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const students = await studentService.getAllstudents();
        const unsuccessfulSchedules = await unsuccessfulService.getAllStudentUnsuccessfulSchedules();
        return res.json({ students, unsuccessfulSchedules });
    }
    catch(err){
        console.error("Error in getStudentData:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getBanList(req, res){
    try{
        const token = authService.verifyToken(req);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const studentBanList = await studentService.getBannedStudent();
        const tutorBanList = await tutorService.getBannedTutor();
        const banList = [...studentBanList, ...tutorBanList];
        return res.json({banList});
    }
    catch(err){
        console.error("Error in getBanList:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
    
}

export async function getReportList(req, res){
    try{
        const {studentId} = req.body;
        const reports = await reportClient.find({studentId}).toArray();
        return res.json({reports});
    }
    catch(err){
        console.error("Error in send Notification:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function sendNotification(req, res){
    try{
        const token = authService.verifyToken(req);
        if(!token){
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const {id, notification} = req.body;
        await notificationService.createNotification(id, 'Thông báo từ Admin',notification);
        const io = req.app.get('io');
        if(io){
            notificationService.emitNotification(io, id);
        }
        return res.json({success: true});
    }
    catch(err){
        console.error("Error in send Notification:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function unbanUser(req, res){
    try{
        const {id, role, email, message} = req.body;
        await accountService.unbanUser(id);
        if(role === 'tutor'){
            await tutorService.updateBanStatus(id, false);
        }
        else{
            await studentService.updateBanStatus(id, false);
        }
        await emailService.sendEmail(email, 'Thông báo từ HCMUT Study', message);
        return res.json({success: true});
    }
    catch(err){
        console.error("Error in unban user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function banUser(req, res){
    try{
        const {id, role, email, message} = req.body;
        await accountService.banUser(id);
        if(role === 'tutor'){
            await tutorService.updateBanStatus(id, true);
        }
        else{
            await studentService.updateBanStatus(id, true);
        }
        await emailService.sendEmail(email, 'Thông báo từ HCMUT Study', message);
        return res.json({success: true});
    }
    catch(err){
        console.error("Error in ban user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}