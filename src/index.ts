import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { authenticateJWT } from "./middlewares/authenticateJWT.js";
import authRoutes from "./routes/authRoutes.js";
import ingredientRoutes from "./routes/ingredientRoutes.js";
import portionRoutes from "./routes/portionRoutes.js";
import snackRoutes from "./routes/snackRoutes.js";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
// Public auth routes
app.use("/api/v1/auth", authRoutes);

// API routes
app.use("/api/v1/ingredients", ingredientRoutes);
app.use("/api/v1/portions", portionRoutes);
app.use("/api/v1/snacks", snackRoutes);

app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  // Validação simples
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email and password are required." });
  }

  // Normalizar email
  const normalizedEmail = email.toLowerCase().trim();

  // Validação de email
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Validação de força de senha (mínimo 8 caracteres, 1 maiúscula, 1 número, 1 caractere especial)
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must have at least 8 characters, 1 uppercase, 1 number and 1 special character (@$!%*?&).",
    });
  }

  try {
    // Hash the password before saving (custo 12 para melhor segurança)
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashedPassword },
    });
    // Não retornar password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already registered." });
    }
    res.status(400).json({ error: "Error creating user." });
  }
});

app.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: "Acesso autorizado!", user: req.user });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
