import { Router } from 'express';
import { getAllRecipes, getRecipeById, getAllCategories, createRecipe, getAllAllergies, getFavorites, getMyRecipes, addFavorite, removeFavorite, isFavorite, updateRecipe } from '../controllers/recipeController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.get("/", getAllRecipes);
router.post("/", authMiddleware, upload.single('image'), createRecipe);
router.get("/categories", getAllCategories);
router.get("/allergens", getAllAllergies);

router.get("/favorites", authMiddleware, getFavorites);
router.get("/my-recipes", authMiddleware, getMyRecipes);

router.post("/:id/favorite", authMiddleware, addFavorite);
router.delete("/:id/favorite", authMiddleware, removeFavorite);
router.get("/:id/is-favorite", authMiddleware, isFavorite);
router.put("/:id", authMiddleware, upload.single('image'), updateRecipe);
router.get("/:id", getRecipeById);

export default router;
