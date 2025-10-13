import { verifySsoToken } from "../services/tokenService.js";

export function checkAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "missing authorization header" });
    return null;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "missing token" });
    return null;
  }

  const success = verifySsoToken(token);
  if (!success) {
    res.status(401).json({ error: "wrong token" });
    return null;
  }

  return token;
}
