import { authService } from "../services/authService.js";
import { notificationService } from "../services/notificationService.js";

export async function getNotifications(req, res) {
  try {
    const id = authService.authenticateRequest(req, res);
    const notifications = await notificationService.getNotificationById(id);
    res.json({ notifications });
  } 
  catch (err) {
    console.error("Error fetching notifications:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function readNotification(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { _id } = req.body;
    await notificationService.readNotification(_id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error read notification:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const token = authService.verifyToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { _id } = req.body;
    await notificationService.deleteNotification(_id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error delete notification:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
