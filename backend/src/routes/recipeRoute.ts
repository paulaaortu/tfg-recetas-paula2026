import { Router } from 'express';
import { getAllRecipes, getRecipeById, getAllCategories } from '../controllers/recipeController';

const router = Router();

router.get("/", getAllRecipes);
router.get("/categories", getAllCategories);
router.get("/:id", getRecipeById);

export default router;
