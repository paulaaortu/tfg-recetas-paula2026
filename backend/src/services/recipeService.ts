import { pool } from "../db";

export class RecipeService {
    async getAllRecipes(official?: string, search?: string, category?: string, strictPantry?: string, userId?: number) {
        let query = `
            SELECT r.*, c.name as category_name 
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
        `;
        const params: any[] = [];
        let conditions: string[] = [];

        if (official !== undefined) {
            params.push(official === "true");
            conditions.push(`r.is_official = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(r.title ILIKE $${params.length} OR r.description ILIKE $${params.length})`);
        }

        if (category && category !== 'Ver todo' && category !== 'undefined') {
            params.push(category);
            conditions.push(`c.name = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        const result = await pool.query(query, params);
        let recipes = result.rows;

        if (strictPantry === 'true' && userId) {
            const pantryQuery = `SELECT ingredient_name FROM pantry WHERE user_id = $1`;
            const pantryResult = await pool.query(pantryQuery, [userId]);
            const pantryIngredients = pantryResult.rows.map((row: any) => row.ingredient_name.toLowerCase());

            recipes = recipes.filter((recipe: any) => {
                if (!recipe.ingredients) return false;

                const recipeIngredientsList = recipe.ingredients.split(',').map((i: string) => i.trim().toLowerCase());

                return recipeIngredientsList.every((recipeIng: string) => {
                    return pantryIngredients.some((pantryIng: string) => 
                        recipeIng.includes(pantryIng) || pantryIng.includes(recipeIng)
                    );
                });
            });
        }

        return recipes;
    }

    async getCategories() {
        const query = "SELECT * FROM categories ORDER BY name ASC";
        const result = await pool.query(query);
        return result.rows;
    }

    async getAllAllergies() {
        const query = "SELECT * FROM allergies ORDER BY name ASC";
        const result = await pool.query(query);
        return result.rows;
    }

    async getRecipeById(id: number) {
        const query = `
            SELECT r.*, c.name as category_name 
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE r.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async createRecipe(recipe: {
        title: string;
        description?: string;
        time?: number;
        ingredients: string;
        steps: string;
        image_url?: string;
        is_official: boolean;
        category_id: number;
        author_id: number;
    }) {
        const query = `
            INSERT INTO recipes 
            (title, description, time, ingredients, steps, image_url, is_official, category_id, author_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            recipe.title,
            recipe.description || null,
            recipe.time || null,
            recipe.ingredients,
            recipe.steps,
            recipe.image_url || null,
            recipe.is_official,
            recipe.category_id,
            recipe.author_id
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }
}
