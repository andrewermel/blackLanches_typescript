import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function verifyPassword(
  token: string,
  secret: string,
): jwt.JwtPayload | string {
  return jwt.verify(token, secret);
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validação simples
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Normalizar email
  const normalizedEmail = email.toLowerCase().trim();

  // Validação de email
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 2. Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 3. Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // 4. Generate JWT with better typing
    const secret = process.env.JWT_SECRET as string;
    if (!secret) {
      return res.status(500).json({ error: "JWT secret not configured." });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
      expiresIn: "1h",
    });

    // 5. Return token
    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login error." });
  }
};
