import { jwtDecode } from "jwt-decode";
import { appointmentClient, tutorClient, tutorScheduleClient } from "../config/db.js";
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
        const appointment = await appointmentClient.find({id: {$regex:id}, status: 'accepted'}).toArray();
        res.json({tutor, appointment})
    }
    catch(err){
        console.error("❌ Error fetching tutors:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
export async function getSchedule(req, res){
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
        const schedule = await tutorScheduleClient.findOne({id});
        const appointment = await appointmentClient.find({id: {$regex:id}}).toArray();
        res.json({schedule, appointment});
    }
    catch(err){
        console.error("❌ Error fetching tutors:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
export async function addDeleteSlot(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "missing token" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "missing token" });
    }
    const success = verifySsoToken(token);
    if (!success) {
      return res.status(401).json({ error: "wrong token" });
    }
    const decoded = jwtDecode(token);
    const { id } = decoded;
    const { day, time, type } = req.body;
    if (!day || !time || !type) {
      return res.status(400).json({ error: "missing day, time or type" });
    }
    const doc = await tutorScheduleClient.findOne({ id });
    if (!doc) {
      return res.status(404).json({ error: "Tutor schedule not found" });
    }
    let times = doc[day] || [];
    if (type === "add") {
      if (!times.includes(time)) {
        times.push(time);
      }
      times.sort((a, b) => {
        const [startA] = a.split(" - ");
        const [startB] = b.split(" - ");
        const [hA, mA] = startA.split(":").map(Number);
        const [hB, mB] = startB.split(":").map(Number);
        return hA * 60 + mA - (hB * 60 + mB);
      });
    } 
    else if (type === "delete") {
      times = times.filter(t => t !== time);
    } 
    else {
      return res.status(400).json({ error: "Invalid type (must be add or delete)" });
    }
    await tutorScheduleClient.updateOne(
      { id },
      { $set: { [day]: times } }
    );
    const io = req.app.get("io");
    if (io) {
      io.emit("tutorScheduleUpdated", { tutorId: id, day, times });
    }
    res.json({ success: true, times });
  } catch (error) {
    console.error("❌ Lỗi trong addDeleteSlot:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
export async function acceptOrCancel(req, res){
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
      const { id } = decoded;
      const { status, slotId, type, detail, reason } = req.body;
      if(!reason){ 
        await appointmentClient.findOneAndUpdate(
          {
            id: { $regex: id},
            slotId: slotId, 
          },
          {
            $set: {
              status: status,
              type: type,
              link: (type==='online') ? detail : '',
              location: (type==='offline') ? detail : ''
            },
          },
        );
      }
      else {
        await appointmentClient.findOneAndUpdate(
          {
            id: { $regex: id},
            slotId: slotId, 
          },
          {
            $set: {
              status: status,
              reason: reason
            },
          },
        );
      }
      const io = req.app.get("io");
      io.emit("appointment-updated", {
        id,
        slotId,
        status,
        type,
        reason,
      });
      res.json({success: true});
    }
    catch(err){
        console.error("❌ Error fetching tutors:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
export async function decline(req, res){
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
        const { id } = decoded;
        const { reason, slotId} = req.body;
        await appointmentClient.findOneAndDelete(
          {
            id: { $regex: id},
            slotId: slotId, 
          }
        );
        res.json({success: true});
    }
    catch(err){
        console.error("❌ Error fetching tutors:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}