import { Request, Response } from "express";
import { pool } from "../db";

export const getAllRecipes = async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM recipes");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error fetching recipes" });
    }
};
