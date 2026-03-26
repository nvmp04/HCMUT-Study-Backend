import { authService } from "../../services/authService.js";
import { appointmentService } from "./appointment.service.js";

export async function getAppointments(req, res){
    try{
        const decoded = authService.authenticateRequest(req);
        const appointments = await appointmentService.getUserAppointments(decoded.id);
        if(!appointments){
            return res.status(404).json({error: 'Appointments not found!'})
        }
        res.json({appointments});
    }
    catch(err){
        const statusCode = err.status;
        res.status(statusCode).json({error: err.message})
    }
}