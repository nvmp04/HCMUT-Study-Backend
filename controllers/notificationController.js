import { jwtDecode } from "jwt-decode";
import { ObjectId } from "mongodb";
import { notificationClient } from "../config/db.js";
import { checkAuth } from "../utils/checkAuth.js";

export async function addNotification(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;
    const { notification } = req.body;
    if (!notification) {
      return res.status(400).json({ error: "Thiếu dữ liệu notification" });
    }
    await notificationClient.insertOne(notification);
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        notifId: notification.id
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error add notification:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getNotifications(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;
    const decoded = jwtDecode(token);
    const { id } = decoded;
    const notifications = await notificationClient
      .find({ id })
      .sort({ time: -1 })
      .toArray();

    res.json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function readNotification(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;
    const decoded = jwtDecode(token);
    const {id} = decoded;
    const { _id } = req.body;
    await notificationClient.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { read: true } },
      { returnDocument: "after" }
    );
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        notifId: id
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error read notification:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const token = checkAuth(req, res);
    if (!token) return;
    const { _id } = req.body;
    await notificationClient.deleteOne({ _id: new ObjectId(_id) });
    res.json({ success: true });
  } catch (err) {
    console.error("Error delete notification:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
