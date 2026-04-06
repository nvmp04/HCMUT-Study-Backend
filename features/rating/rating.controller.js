import { tutorService } from "../../services/tutorService.js";
import { appointmentService } from "../appointment/appointment.service.js";
import { authService } from "../auth/auth.service.js";

export async function rating(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { tutorId, rating: ratingValue, _id } = req.body;
    await appointmentService.rateAppointment(_id, ratingValue);
    const result = await tutorService.updateRating(tutorId, ratingValue);
    return res.status(200).json({
      message: "Rating updated successfully",
      data: result
    });
  } catch (err) {
    console.error("Error in rating:", err);
    
    if (err.message === 'Tutor not found') {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}