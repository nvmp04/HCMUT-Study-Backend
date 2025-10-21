import express from "express";
import { banUser, getBanList, getReportList, getStudents, getTutors, sendNotification, unbanUser } from "../controllers/adminController.js";

const router = express.Router();
router.get('/gettutors', getTutors);
router.get('/getstudents', getStudents);
router.post('/getreportlist', getReportList);
router.post('/sendnotification', sendNotification);
router.get('/getbanlist', getBanList);
router.put('/unban', unbanUser);
router.put('/ban', banUser);
export default router;