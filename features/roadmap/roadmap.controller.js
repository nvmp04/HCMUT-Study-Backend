import { roadmapClient, tutorClient } from "../../config/db.js";
import { aiService } from "../../services/aiService.js";
import { authService } from "../auth/auth.service.js";

export async function AIgenerate(req, res) {
  try {
    const user = authService.authenticateRequest(req, res);
    if (!user) return; 
    const userId = user.id ; 
    const { field, interests, level, goal, hoursPerWeek, subjectName } = req.body;

    let roadmapText;
    if (subjectName) {
      roadmapText = await aiService.generateSubjectRoadmap(subjectName, level, hoursPerWeek, goal);
    } else {
      roadmapText = await aiService.genarateRoadmap(field, interests, level, hoursPerWeek, goal);
    }
    const [roadmapJSON, tutorsRaw] = await Promise.all([
      aiService.convertRoadmapToJSON(roadmapText),
      aiService.findTutor(roadmapText)
    ]);

    let tutors = [];
    if (typeof tutorsRaw === 'string') {
      try {
        tutors = JSON.parse(tutorsRaw);
      } catch (err) {
        console.error('Lỗi parse JSON gia sư:', err);
      }
    } else {
      tutors = tutorsRaw;
    }

    roadmapJSON["id"] = userId;
    roadmapJSON["tutors"] = tutors;

    await roadmapClient.updateOne(
      { id: userId },
      { $set: roadmapJSON },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error in generate:", err);
    if (err.status === 503) {
      return res.status(503).json({ message: "AI đang bận, thử lại sau nhé!" });
    }
    return res.status(500).json({ message: "Lỗi hệ thống khi tạo lộ trình" });
  }
}

export async function getRoadmap(req, res){
  try{
    const payload = authService.authenticateRequest(req, res);
    const roadmap = await roadmapClient.findOne({id: payload.sub});
    res.json({roadmap});
  }
  catch(err){
    console.error("Error in get roadmap:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSuitableTutors(req, res){
  try{
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {tutorsId} = req.body;
    const ids = tutorsId.map(item => item.id);

    const tutors = await tutorClient.find({ id: { $in: ids } }).toArray();
    res.json({tutors});
  }
  catch(err){
    console.error("Error in get suitable tutors:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}