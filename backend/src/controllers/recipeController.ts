import { Request, Response } from "express";
import { RecipeService } from "../services/recipeService";

const recipeService = new RecipeService();

export const getAllRecipes = async (req: Request, res: Response) => {
    const { official } = req.query;
    try {
        const recipes = await recipeService.getAllRecipes(official as string);
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: "Error cargando las recetas" });
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