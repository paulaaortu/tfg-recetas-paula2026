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
