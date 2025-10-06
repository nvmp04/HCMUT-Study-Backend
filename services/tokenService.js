// services/tokenService.js
import jwt from 'jsonwebtoken';

const SSO_SECRET = process.env.SSO_SECRET || 'sso_secret_demo';
export function signSsoToken(payload) {
  return jwt.sign(payload, SSO_SECRET, { expiresIn: '1h' });
}
export function verifySsoToken(token) {
  return jwt.verify(token, SSO_SECRET);
}
