import { Request, Response } from "express";
import { CategoryService } from "../services/categoryService";

const categoryService = new CategoryService();

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await categoryService.getCategories();
        res.json(categories);
    } catch (error) {
        console.error("Error loading categories:", error);
        res.status(500).json({ error: "Error cargando las categorías" });
    }
};
