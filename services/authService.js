import { jwtDecode } from "jwt-decode";
import { verifySsoToken } from "./tokenService.js";
import { checkAuth } from "../utils/checkAuth.js";

export class AuthService {
  authenticateRequest(req, res) {
    const token = checkAuth(req, res);
    if (!token) {
      const err = new Error('No token provided!');
      err.status = 401;
      throw(err);
    }

    const success = verifySsoToken(token);
    if (!success) {
      const err = new Error('Invalid or expired token!');
      err.status = 401;
      throw(err);
    }
    return jwtDecode(token);
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