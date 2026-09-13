import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload } from "../types/auth";

const JWT_SECRET = "dev-secret-change-this-later";

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.user = payload;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

export { JWT_SECRET };