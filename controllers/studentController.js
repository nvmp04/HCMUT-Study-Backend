import { studentClient, tutorClient } from "../config/db.js";
import { verifySsoToken } from "../services/tokenService.js";
import { jwtDecode } from "jwt-decode";
export async function getTutorsData(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        if (!token) {
        return res.status(401).json({ error: 'missing token' });
        }
        const success = verifySsoToken(token); 
        if (!success) {
        return res.status(401).json({ error: 'wrong token' });
        }
        const tutors = await tutorClient.find().toArray();
        return res.json({tutors});
    } catch (err) {
        console.error("❌ Error fetching tutors:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
export async function getTutorData(req, res){
    try{
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        if (!token) {
        return res.status(401).json({ error: 'missing token' });
        }
        const success = verifySsoToken(token); 
        if (!success) {
        return res.status(401).json({ error: 'wrong token' });
        }
        const {id} = req.body;
        const tutor = await tutorClient.findOne({id});
        res.json({tutor});
    }
    catch(err){
        console.error("❌ Error fetching tutors:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
export async function getStudentData(req, res){
    try{
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        if (!token) {
        return res.status(401).json({ error: 'missing token' });
        }
        const success = verifySsoToken(token); 
        if (!success) {
        return res.status(401).json({ error: 'wrong token' });
        }
        const decoded = jwtDecode(token);
        const {id} = decoded;
        const student = await studentClient.findOne({id});
        res.json({student});
    }
    catch(err){
        console.error("❌ Error fetching tutors:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}