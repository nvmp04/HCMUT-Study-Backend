import express from "express";
import { deleteNotification, readNotification, getNotifications } from "../controllers/notificationController.js";

const router = express.Router();
router.get('/get', getNotifications);
router.put('/read', readNotification);
router.delete('/delete', deleteNotification)
export default router;