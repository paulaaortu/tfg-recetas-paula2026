import { Request, Response } from "express";
import { pool } from "../db";

export const getAllRecipes = async (req: Request, res: Response) => {
    const { official } = req.query;
    try {
        let query = "SELECT * FROM recipes";
        const params: any[] = [];

        if (official !== undefined) {
            query += " WHERE is_official = $1";
            params.push(official === "true");
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ error: "Error fetching recipes" });
    }
};
