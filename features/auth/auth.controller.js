import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../../core/auth/token.service.js';
import { accountClient } from '../../config/db.js';
import { authService } from './auth.service.js';

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = await accountClient.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (user.banned) {
    return res.status(403).json({ banned: true, message: 'Your account is suspended' });
  }
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({
    sub: user._id, 
    roles: user.roles
  });
  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      roles: user.roles
    }
  });
}

export async function userinfo(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = verifyToken(token);
    return res.json({ user: payload });
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export async function tutorMode(req, res) {
  try {
    const payload = authService.authenticateRequest(req);
    if (!payload) {
      return res.status(401).json({ error: 'Xác thực không hợp lệ hoặc thiếu Token' });
    }
    const { sub, roles } = payload;
    const permission = await authService.tutorAuthentication(sub, roles);
    return res.status(200).json(permission);
  } catch (error) {
    const statusCode = error?.status;
    if(statusCode === 404){
      return res.status(200).json({status: 'tutor-register', canSwitch: false})
    }
    console.error(`[Switch Role Error]: ${error.message}`);
    return res.status(statusCode || 500).json({ 
      error: 'Lỗi hệ thống khi xử lý chuyển đổi vai trò',
      message: error.message || 'Internal Server error'
    });
  }
}