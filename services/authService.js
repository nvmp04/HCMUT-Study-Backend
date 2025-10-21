import { jwtDecode } from "jwt-decode";
import { verifySsoToken } from "./tokenService.js";
import { checkAuth } from "../utils/checkAuth.js";

export class AuthService {
  authenticateRequest(req, res) {
    const token = checkAuth(req, res);
    if (!token) return null;

    const success = verifySsoToken(token);
    if (!success) {
      res.status(401).json({ error: 'wrong token' });
      return null;
    }

    const decoded = jwtDecode(token);
    return decoded.id;
  }

  verifyToken(req) {
    const token = checkAuth(req);
    if (!token) return null;

    const success = verifySsoToken(token);
    if (!success) return null;

    const decoded = jwtDecode(token);
    return decoded.id;
  }
}

export const authService = new AuthService();