import { Request, Response } from "express";
import { FavoriteService } from "../services/favoriteService";

const favoriteService = new FavoriteService();

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
