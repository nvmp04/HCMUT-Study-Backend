import { jwtDecode } from "jwt-decode";
import { tutorClient } from "../config/db.js";
import { verifySsoToken } from "../services/tokenService.js";

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
        const decoded = jwtDecode(token);
        const {id} = decoded;
        const tutor = await tutorClient.findOne({id});
        res.json({tutor})
    }
    catch(err){
        console.error("❌ Error fetching tutors:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}