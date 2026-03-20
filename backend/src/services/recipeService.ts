import { pool } from "../db";

export class RecipeService {
    async getAllRecipes(official?: string, search?: string, category?: string, strictPantry?: string, userId?: number) {
        let query = `
            SELECT r.*, c.name as category_name, u.username as author_name
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
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

        query += " ORDER BY r.created_at DESC";

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

    async getRecommendedRecipes(userId: number) {
        // Get user preferences
        const [intolerancesRes, objectivesRes] = await Promise.all([
            pool.query(
                `SELECT i.name FROM intolerances i
                 JOIN user_intolerances ui ON i.id = ui.intolerance_id
                 WHERE ui.user_id = $1`,
                [userId]
            ),
            pool.query(
                `SELECT o.name FROM objectives o
                 JOIN user_objectives uo ON o.id = uo.objective_id
                 WHERE uo.user_id = $1`,
                [userId]
            ),
        ]);

        const userIntolerances = intolerancesRes.rows.map((r: any) => r.name.toLowerCase());
        const userObjectives = objectivesRes.rows.map((r: any) => r.name.toLowerCase());

        // Base query - get all official recipes
        let query = `
            SELECT r.*, c.name as category_name, u.username as author_name
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.is_official = true
        `;

        // Filter intolerances: exclude recipes where allergens contain any user intolerance
        const conditions: string[] = [];
        const params: any[] = [];

        if (userIntolerances.length > 0) {
            // Mapping of intolerances to list of corresponding allergen keywords in recipes
            const intoleranceMap: { [key: string]: string[] } = {
                'lactosa': ['lactosa', 'lácteos', 'leche', 'queso', 'mantequilla'],
                'huevo': ['huevo', 'huevos'],
                'fructosa': ['fructosa'],
                'gluten (celiaquía)': ['gluten', 'trigo', 'cebada', 'centeno', 'avena'],
                'sodio': ['sodio', 'sal'],
            };

            const allergenConditions: string[] = [];
            
            userIntolerances.forEach((intolerance: string) => {
                const searchTerms = intoleranceMap[intolerance] || [intolerance];
                
                searchTerms.forEach(term => {
                    params.push(`%${term}%`);
                    allergenConditions.push(`(r.allergens IS NOT NULL AND LOWER(r.allergens) LIKE $${params.length})`);
                });
            });

            if (allergenConditions.length > 0) {
                // If the recipe has ANY of the forbidden allergens, skip it.
                // Note: since we already have WHERE is_official = true, we use AND NOT (...)
                conditions.push(`NOT (${allergenConditions.join(' OR ')})`);
            }
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        // If user wants to lose weight, prioritize low-calorie recipes
        const wantsToLoseWeight = userObjectives.some((obj: string) =>
            obj.includes('adelgazar') || obj.includes('perder')
        );

        if (wantsToLoseWeight) {
            query += ` ORDER BY CASE WHEN r.calories IS NULL THEN 9999 ELSE r.calories END ASC`;
        } else {
            query += ` ORDER BY r.created_at DESC`;
        }

        query += ` LIMIT 20`;

        const result = await pool.query(query, params);
        return result.rows;
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
            SELECT r.*, c.name as category_name, u.username as author_name
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async createRecipe(recipe: {
        title: string;
        description?: string;
        difficulty?: string;
        allergens?: string;
        time?: number;
        calories?: number;
        ingredients: string;
        steps: string;
        image_url?: string;
        is_official: boolean;
        category_id: number;
        author_id: number;
    }) {
        const query = `
            INSERT INTO recipes 
            (title, description, difficulty, allergens, time, calories, ingredients, steps, image_url, is_official, category_id, author_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            recipe.title,
            recipe.description || null,
            recipe.difficulty || null,
            recipe.allergens || null,
            recipe.time || null,
            recipe.calories || null,
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

    async getFavorites(userId: number) {
        const query = `
            SELECT r.*, c.name as category_name, u.username as author_name
            FROM recipes r
            JOIN favorites f ON r.id = f.recipe_id
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async getMyRecipes(userId: number) {
        const query = `
            SELECT r.*, c.name as category_name, u.username as author_name
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.author_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async addFavorite(userId: number, recipeId: number) {
        const query = `
            INSERT INTO favorites (user_id, recipe_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `;
        await pool.query(query, [userId, recipeId]);
    }

    async removeFavorite(userId: number, recipeId: number) {
        const query = `
            DELETE FROM favorites
            WHERE user_id = $1 AND recipe_id = $2
        `;
        await pool.query(query, [userId, recipeId]);
    }

    async isFavorite(userId: number, recipeId: number) {
        const query = `
            SELECT 1 FROM favorites
            WHERE user_id = $1 AND recipe_id = $2
        `;
        const result = await pool.query(query, [userId, recipeId]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async updateRecipe(id: number, userId: number, recipe: {
        title: string;
        description?: string;
        difficulty?: string;
        allergens?: string;
        time?: number;
        calories?: number;
        ingredients: string;
        steps: string;
        category_id: number;
        image_url?: string;
    }) {
        let query: string;
        let values: any[];

        if (recipe.image_url) {
            query = `
                UPDATE recipes 
                SET title = $1, description = $2, difficulty = $3, allergens = $4, time = $5, 
                    calories = $6, ingredients = $7, steps = $8, category_id = $9, image_url = $10
                WHERE id = $11 AND author_id = $12
                RETURNING *
            `;
            values = [
                recipe.title, recipe.description || null, recipe.difficulty || null, 
                recipe.allergens || null, recipe.time || null, recipe.calories || null,
                recipe.ingredients, recipe.steps, recipe.category_id, recipe.image_url, id, userId
            ];
        } else {
            query = `
                UPDATE recipes 
                SET title = $1, description = $2, difficulty = $3, allergens = $4, time = $5,
                    calories = $6, ingredients = $7, steps = $8, category_id = $9
                WHERE id = $10 AND author_id = $11
                RETURNING *
            `;
            values = [
                recipe.title, recipe.description || null, recipe.difficulty || null, 
                recipe.allergens || null, recipe.time || null, recipe.calories || null,
                recipe.ingredients, recipe.steps, recipe.category_id, id, userId
            ];
        }

        const result = await pool.query(query, values);
        return result.rows[0];
    }
}
