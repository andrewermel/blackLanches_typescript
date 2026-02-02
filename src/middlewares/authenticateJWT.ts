// Adiciona tipagem para req.user
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function verifyToken(token: string, secret: string): any {
  return jwt.verify(token, secret);
}

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Token not provided." });
    return;
  }

  // Validar schema Bearer
  if (!authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({
        error:
          "Invalid authorization header format. Expected 'Bearer <token>'.",
      });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: "JWT secret not configured." });
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const decoded = verifyToken(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
}
