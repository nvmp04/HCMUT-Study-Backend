import { Router } from "express";
import { login, tutorMode, userinfo } from "./auth.controller.js";

const router = new Router();

router.post('/login', login);
router.get('/userinfo', userinfo);
router.get('/tutor-mode', tutorMode);

export default router;