import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import * as userController from '../controllers/userController';
import * as recipeController from '../controllers/recipeController';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

router.get('/users', userController.getAllUsers);
router.delete('/users/:id', userController.deleteUser);
router.get('/recipes', recipeController.getAdminRecipes);
router.delete('/recipes/:id', recipeController.deleteRecipe);

export default router;
