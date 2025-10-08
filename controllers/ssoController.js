import bcrypt from 'bcryptjs';
import { signSsoToken, verifySsoToken } from '../services/tokenService.js';
import { accountClient } from '../config/db.js';

export async function login(req, res) {
  const { username, password} = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username/password required' });
  const user = await accountClient.findOne({userName: username});
  if (!user) return res.json({ error: 'invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.json({ error: 'invalid credentials' });
  const ssoToken = signSsoToken({
    id: user.id,
    role: user.role
  });
  return res.json({
    ssoToken,
    user: {
      id: user.id,
      role: user.role
    }
  });
}

export async function userinfo(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = verifySsoToken(token);
    return res.json({ user: payload });
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}
