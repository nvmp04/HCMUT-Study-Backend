import { jwtDecode } from "jwt-decode";
import { signToken, verifyToken } from "../../core/auth/token.service.js";
import { checkAuth } from "./auth.util.js";
import { userSevice } from "../user/user.service.js";

export class AuthService {
  authenticateRequest(req, res) {
    const token = checkAuth(req, res);
    if (!token) {
      const err = new Error('No token provided!');
      err.status = 401;
      throw(err);
    }

    const success = verifyToken(token);
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

    const success = verifyToken(token);
    if (!success) return null;

    const payload = jwtDecode(token);
    return payload.sub;
  }

  async tutorAuthentication(sub, roles){
    try{
      const tutor = await userSevice.getTutorProfile(sub);
      if(tutor.statusType === 'active'){
      //Trả về token đăng nhập mới nếu hồ sơ đã được duyệt
        const newToken = signToken({
          sub, roles, currentRole: 'tutor'
        })
        return {status: tutor.statusType, token: newToken};
      }
      //Trường hợp hồ sơ đang ở trạng thái pending hoặc rejected
      return {status: tutor.statusType};
    }
    catch(err){
      const statusCode = err.status;
      if(statusCode === 404) return {status: 'tutor-register'};
      throw(err);
    }
  }
}

export const authService = new AuthService();