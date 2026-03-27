import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
