import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import * as adminController from '../controllers/adminController';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/recipes', adminController.getAdminRecipes);
router.delete('/recipes/:id', adminController.deleteRecipe);

export default router;
