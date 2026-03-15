import { Router } from 'express';
import { getAllRecipes, getRecipeById, getAllCategories, createRecipe } from '../controllers/recipeController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.get("/", getAllRecipes);
router.post("/", authMiddleware, upload.single('image'), createRecipe);
router.get("/categories", getAllCategories);
router.get("/:id", getRecipeById);

export default router;
