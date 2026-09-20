import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AuthTokenPayload } from "../types/auth";

// Loaded here as well as in server.ts, because this module is imported before
// dotenv.config() runs in the server entry point (same pattern as db.ts).
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-this-later";

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

/**
 * Verifies a JWT. Throws when the token is missing, malformed or expired.
 * Shared by the HTTP middleware below and the Socket.IO handshake.
 */
export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
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
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

export { JWT_SECRET };