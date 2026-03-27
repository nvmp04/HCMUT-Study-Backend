import { Router } from "express";
import { login, userinfo } from "./auth.controller.js";

const router = new Router();

router.post('/login', login);
router.get('/userinfo', userinfo);

export default router;