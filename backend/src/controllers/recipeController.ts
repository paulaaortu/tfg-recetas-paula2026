import { Request, Response } from "express";
import { RecipeService } from "../services/recipeService";
import jwt from "jsonwebtoken";

const recipeService = new RecipeService();
const JWT_SECRET = process.env.JWT_SECRET || 'jsnE982nsAsok.';

export const getAllRecipes = async (req: Request, res: Response) => {
    const { official, search, category, strictPantry, difficulty, maxIngredients, maxTime, maxCalories } = req.query;
    let userId: number | undefined;

    if (strictPantry === 'true') {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
                userId = decoded.id;
            } catch (error) {
                return res.status(401).json({ message: 'Token inválido o expirado.' });
            }
        } else {
            return res.status(401).json({ message: 'No autorizado. Token requerido para búsqueda por despensa.' });
        }
    }

    try {
        const recipes = await recipeService.getAllRecipes(
            official as string,
            search as string,
            category as string,
            strictPantry as string,
            userId,
            difficulty as string,
            maxIngredients ? Number(maxIngredients) : undefined,
            maxTime ? Number(maxTime) : undefined,
            maxCalories ? Number(maxCalories) : undefined
        );
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: "Error cargando las recetas" });
    }
};

export const getRecommendedRecipes = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) return res.status(401).json({ message: "No autorizado" });
        const recipes = await recipeService.getRecommendedRecipes(user.id);
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: "Error cargando recomendaciones" });
    }
};

export const getRecipeById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
        return res.status(400).json({ error: "ID de receta inválido" });
    }

    try {
        const recipe = await recipeService.getRecipeById(numericId);
        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ error: "Receta no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la receta" });
    }
};

export const createRecipe = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const { title, description, difficulty, allergens, time, calories, ingredients, steps, category_id, is_official } = req.body;
        console.log('CREATE RECIPE REQ BODY:', { time, calories });

        if (!title || !ingredients || !steps || !category_id) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const newRecipe = await recipeService.createRecipe({
            title,
            description,
            difficulty,
            allergens,
            time: (time !== undefined && time !== null && time !== '') ? Number(time) : undefined,
            calories: (calories !== undefined && calories !== null && calories !== '') ? Number(calories) : undefined,
            ingredients,
            steps,
            category_id: Number(category_id),
            author_id: user.id,
            image_url: imageUrl,
            is_official: (user.is_admin && (is_official === 'true' || is_official === true))
        });

        res.status(201).json(newRecipe);
    } catch (error) {
        console.error("Error al crear la receta", error);
        res.status(500).json({ error: "Error interno creando la receta" });
    }
};

export const getMyRecipes = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) return res.status(401).json({ message: "No autorizado" });
        const recipes = await recipeService.getMyRecipes(user.id);
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo mis recetas" });
    }
};

export const updateRecipe = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const { id } = req.params;
        const numericId = Number(id);
        if (isNaN(numericId)) {
            return res.status(400).json({ error: "ID de receta inválido" });
        }

        const { title, description, difficulty, allergens, time, calories, ingredients, steps, category_id } = req.body;

        if (!title || !ingredients || !steps || !category_id) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        let imageUrl = undefined;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const updateData: any = {
            title,
            description,
            difficulty,
            allergens,
            time: (time !== undefined && time !== null && time !== '') ? Number(time) : undefined,
            calories: (calories !== undefined && calories !== null && calories !== '') ? Number(calories) : undefined,
            ingredients,
            steps,
            category_id: Number(category_id),
            image_url: imageUrl,
        };

        if (user.is_admin) {
            updateData.is_official = (req.body.is_official === 'true' || req.body.is_official === true);
        }

        const updatedRecipe = await recipeService.updateRecipe(numericId, user.id, user.is_admin, updateData);

        if (!updatedRecipe) {
            return res.status(404).json({ message: "Receta no encontrada o no tienes permiso para editarla" });
        }

        res.json(updatedRecipe);
    } catch (error) {
        console.error("Error al actualizar la receta", error);
        res.status(500).json({ error: "Error interno actualizando la receta" });
    }
};

export const deleteRecipe = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = (req as any).user;
        if (!user || !user.id) {
            return res.status(401).json({ message: "No autorizado" });
        }

        const numericId = Number(id);
        const recipe = await recipeService.getRecipeById(numericId);
        
        if (!recipe) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        if (recipe.author_id !== user.id && !user.is_admin) {
            return res.status(403).json({ message: "No tienes permiso para eliminar esta receta" });
        }

        await recipeService.deleteRecipe(numericId);
        res.json({ message: "Receta eliminada correctamente" });
    } catch (error) {
        console.error("Error deleting recipe:", error);
        res.status(500).json({ message: "Error al eliminar receta." });
    }
};

export const getAdminRecipes = async (req: Request, res: Response) => {
    const { type } = req.query;
    try {
        const recipes = await recipeService.getAllRecipes(type === 'official' ? 'true' : 'false');
        res.json(recipes);
    } catch (error) {
        console.error("Error getting admin recipes:", error);
        res.status(500).json({ message: "Error al obtener recetas." });
    }
};
