import { Request, Response } from "express";
import { FavoriteService } from "../services/favoriteService";
import { RecipeService } from "../services/recipeService";

const favoriteService = new FavoriteService();
const recipeService = new RecipeService();

export const getFavorites = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) return res.status(401).json({ message: "No autorizado" });
        const favorites = await favoriteService.getFavorites(user.id);
        res.json(favorites);
    } catch (error) {
        console.error("Error getting favorites:", error);
        res.status(500).json({ error: "Error obteniendo favoritos" });
    }
};

export const addFavorite = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) return res.status(401).json({ message: "No autorizado" });
        const { id } = req.params;
        const numericId = Number(id);
        if (isNaN(numericId)) return res.status(400).json({ error: "ID de receta inválido" });
        
        const recipe = await recipeService.getRecipeById(numericId);
        if (!recipe) return res.status(404).json({ error: "Receta no encontrada" });
        
        if (recipe.author_id === user.id) {
            return res.status(400).json({ error: "No puedes guardar tu propia receta en favoritos" });
        }

        await favoriteService.addFavorite(user.id, numericId);
        res.json({ message: "Añadido a favoritos" });
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({ error: "Error añadiendo a favoritos" });
    }
};

export const removeFavorite = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) return res.status(401).json({ message: "No autorizado" });
        const { id } = req.params;
        const numericId = Number(id);
        if (isNaN(numericId)) return res.status(400).json({ error: "ID de receta inválido" });
        await favoriteService.removeFavorite(user.id, numericId);
        res.json({ message: "Eliminado de favoritos" });
    } catch (error) {
        console.error("Error removing favorite:", error);
        res.status(500).json({ error: "Error eliminando de favoritos" });
    }
};

export const isFavorite = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) return res.status(401).json({ message: "No autorizado" });
        const { id } = req.params;
        const numericId = Number(id);
        if (isNaN(numericId)) return res.status(400).json({ error: "ID de receta inválido" });
        const isFav = await favoriteService.isFavorite(user.id, numericId);
        res.json({ isFavorite: isFav });
    } catch (error) {
        console.error("Error checking favorite:", error);
        res.status(500).json({ error: "Error al checkear favorito" });
    }
};
