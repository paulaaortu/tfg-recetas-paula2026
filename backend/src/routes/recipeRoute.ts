import { Router } from 'express';
import { getAllRecipes, getRecipeById } from '../controllers/recipeController';

const router = Router();

router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

export default router;
