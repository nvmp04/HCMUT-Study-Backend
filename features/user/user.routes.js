import { Router } from "express";
import { getTutorList, getTutorProfile, getUserProfile } from "./user.controller.js";
const router = Router();

router.get('/profile', getUserProfile);
router.get('/tutor-profile/:id', getTutorProfile);
router.get('/tutor-list', getTutorList);

export default router;