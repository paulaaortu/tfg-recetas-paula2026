import { Request, Response } from "express";
import { AllergyService } from "../services/allergyService";

const allergyService = new AllergyService();

export const getAllAllergies = async (req: Request, res: Response) => {
    try {
        const allergies = await allergyService.getAllAllergies();
        res.json(allergies);
    } catch (error) {
        console.error("Error loading allergies:", error);
        res.status(500).json({ error: "Error cargando los alérgenos" });
    }
};
