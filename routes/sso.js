import express from 'express';
import { login, userinfo } from '../controllers/ssoController.js';

const router = express.Router();

router.post('/login', login);
router.get('/userinfo', userinfo);

export default router;
