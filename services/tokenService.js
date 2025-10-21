import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const SSO_SECRET = process.env.SSO_SECRET;
export function signSsoToken(payload) {
  return jwt.sign(payload, SSO_SECRET, { expiresIn: '2h' });
}
export function verifySsoToken(token) {
  return jwt.verify(token, SSO_SECRET);
}
