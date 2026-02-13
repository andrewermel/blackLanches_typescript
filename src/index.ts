import bcrypt from 'bcryptjs';
import cors from 'cors';
import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleError } from './helpers/errorHandler.js';
import {
  sendValidationError,
  validateRequired,
} from './helpers/validators.js';
import prisma from './lib/prisma.js';
import { authenticateJWT } from './middlewares/authenticateJWT.js';
import authRoutes from './routes/authRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import portionRoutes from './routes/portionRoutes.js';
import snackRoutes from './routes/snackRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());

// Servir arquivos estáticos da pasta public
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../public/uploads'))
);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ingredients', ingredientRoutes);
app.use('/api/v1/portions', portionRoutes);
app.use('/api/v1/snacks', snackRoutes);

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

app.post(
  '/users',
  async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { name, email, password } = req.body;

    const nameError = validateRequired(name, 'Name');
    if (nameError)
      return sendValidationError(nameError, res);

    const emailError = validateRequired(email, 'Email');
    if (emailError)
      return sendValidationError(emailError, res);

    const passwordError = validateRequired(
      password,
      'Password'
    );
    if (passwordError)
      return sendValidationError(passwordError, res);

    const normalizedEmail = email.toLowerCase().trim();

    if (!emailRegex.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ error: 'Invalid email format.' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          'Password must have at least 8 characters, 1 uppercase, 1 number and 1 special character (@$!%*?&).',
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(
        password,
        12
      );
      const user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
        },
      });

      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      return handleError(
        error,
        'Error creating user.',
        res
      );
    }
  }
);

app.get(
  '/protected',
  authenticateJWT,
  (req: Request, res: Response): Response => {
    return res.json({
      message: 'Authorized access.',
      user: req.user,
    });
  }
);

app.listen(3000, () => {
  console.log('Server running on port 3000.');
});
