import { Router } from 'express';
import { getPantry, addItem, removeItem } from '../controllers/pantryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas de despensa requieren autenticación
router.get('/', authMiddleware, (req: any, res, next) => {
    getPantry(req, res).catch(next);
});

router.post('/', authMiddleware, (req: any, res, next) => {
    addItem(req, res).catch(next);
});

router.delete('/:id', authMiddleware, (req: any, res, next) => {
    removeItem(req, res).catch(next);
});

export default router;
