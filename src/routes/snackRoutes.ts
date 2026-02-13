import { Router } from 'express';
import {
  addPortion,
  createSnack,
  deleteSnack,
  getSnack,
  listSnacks,
  removePortion,
} from '../controllers/snackController.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Rotas de snacks
router.post('/', upload.single('image'), createSnack);
router.get('/', listSnacks);
router.get('/:id', getSnack);

// Rotas de associação de porções
router.post('/:snackId/portions/:portionId', addPortion);
router.delete(
  '/:snackId/portions/:portionId',
  removePortion
);

// Rota para deletar snack
router.delete('/:id', deleteSnack);

export default router;
