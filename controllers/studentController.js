import { appointmentClient, studentClient, tutorClient, tutorScheduleClient } from "../config/db.js";
import { jwtDecode } from "jwt-decode";
import { checkAuth } from "../utils/checkAuth.js";
import { ObjectId } from "mongodb";

export async function getTutorsData(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;

    const tutors = await tutorClient.find().toArray();
    return res.json({ tutors });
  } catch (err) {
    console.error("❌ Error fetching tutors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTutorData(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;

    const { id } = req.body;
    const tutor = await tutorClient.findOne({ id });
    res.json({ tutor });
  } catch (err) {
    console.error("❌ Error fetching tutors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getStudentData(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;

    const decoded = jwtDecode(token);
    const { id } = decoded;
    const student = await studentClient.findOne({ id });
    const appointment = await appointmentClient
      .find({ id: { $regex: id }, status: "accepted" })
      .toArray();
    res.json({ student, appointment });
  } catch (err) {
    console.error("❌ Error fetching tutors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getSchedule(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;

    const { id } = req.body;
    const schedule = await tutorScheduleClient.findOne({ id });
    const appointment = await appointmentClient.find({ id: { $regex: id } }).toArray();
    const status = appointment.map((appt) => ({
      slotId: appt.slotId,
      status: appt.status,
    }));
    res.json({ schedule, status });
  } catch (err) {
    console.error("❌ Error fetching tutors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function bookSession(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;

    const {
      id,
      status,
      studentName,
      studentPhone,
      tutorName,
      tutorPhone,
      date,
      time,
      slotId,
      title,
      type,
      location,
      link,
      reason,
    } = req.body;

    await appointmentClient.insertOne({
      id,
      status,
      studentName,
      studentPhone,
      tutorName,
      tutorPhone,
      date,
      time,
      slotId,
      title,
      type,
      location,
      link,
      reason,
    });

    const tutorId = id.slice(0, 7);
    const io = req.app.get("io");
    if (io) {
      io.emit("booksession", {
        tutorId,
        slotId,
        date,
        time,
        title,
        name: studentName,
        type: "booked",
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error fetching tutors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMySchedule(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;

    const decoded = jwtDecode(token);
    const { id } = decoded;
    const appointment = await appointmentClient.find({ id: { $regex: id } }).toArray();
    res.json({ appointment });
  } catch (err) {
    console.error("❌ Error fetching tutors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function cancelled(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;

    const decoded = jwtDecode(token);
    const { id } = decoded;
    const { status, reason, slotId } = req.body;

    const appt = await appointmentClient.findOneAndUpdate(
      {
        id: { $regex: id },
        slotId: slotId,
      },
      {
        $set: {
          id: id,
          status: status,
          reason: reason,
        },
      }
    );

    const tutorId = appt.id.slice(0, 7);
    const { studentName } = appt;
    const io = req.app.get("io");
    io.emit("studentcancel", {
      id,
      tutorId,
      name: studentName,
      slotId,
      type: "cancelled",
      reason,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error fetching tutors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function cancelBeforeAccept(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;

    const decoded = jwtDecode(token);
    const { id } = decoded;
    const { slotId } = req.body;

    const appt = await appointmentClient.findOneAndDelete({
      id: { $regex: id },
      slotId: slotId,
    });

    const tutorId = appt.id.slice(0, 7);
    const io = req.app.get("io");
    io.emit("cancelbeforeaccept", {
      slotId,
      studentId: id,
      tutorId,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error fetching tutors:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteCancelled(req, res) {
    try{
        const token = checkAuth(req, res);
        if(!token) return;
        const decoded = jwtDecode(token);
        const {_id} = req.body;
        await appointmentClient.findOneAndDelete({_id: new ObjectId(_id)})
        res.json({success: true});
    }
    catch(err){
        console.error("❌ Error delete cancelled:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
