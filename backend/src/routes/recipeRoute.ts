import { Router } from 'express';
import { 
    getAllRecipes, 
    getRecipeById, 
    createRecipe, 
    getMyRecipes, 
    updateRecipe, 
    getRecommendedRecipes 
} from '../controllers/recipeController';
import * as categoryController from '../controllers/categoryController';
import * as allergyController from '../controllers/allergyController';
import * as favoriteController from '../controllers/favoriteController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.get("/", getAllRecipes);
router.post("/", authMiddleware, upload.single('image'), createRecipe);
router.get("/categories", categoryController.getAllCategories);
router.get("/allergens", allergyController.getAllAllergies);

router.get("/favorites", authMiddleware, favoriteController.getFavorites);
router.get("/my-recipes", authMiddleware, getMyRecipes);
router.get("/recommended", authMiddleware, getRecommendedRecipes);

router.post("/:id/favorite", authMiddleware, favoriteController.addFavorite);
router.delete("/:id/favorite", authMiddleware, favoriteController.removeFavorite);
router.get("/:id/is-favorite", authMiddleware, favoriteController.isFavorite);
router.put("/:id", authMiddleware, upload.single('image'), updateRecipe);
router.get("/:id", getRecipeById);

export default router;
