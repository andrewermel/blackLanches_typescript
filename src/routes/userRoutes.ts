import { Router } from 'express';
import { createUser } from '../controllers/userController.js';

/**
 * 👤 User Routes
 *
 * Rotas relacionadas a usuários:
 * - POST /api/v1/users - Criar novo usuário
 */

const router = Router();

router.post('/', createUser);

export default router;
