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

        let query = `
            SELECT r.*, c.name as category_name, u.username as author_name
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.is_official = true
        `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (userIntolerances.length > 0) {
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
                conditions.push(`NOT (${allergenConditions.join(' OR ')})`);
            }
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

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

    async updateRecipe(id: number, userId: number, isAdmin: boolean, recipe: {
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
        is_official?: boolean;
    }) {
        const setClauses = [
            'title = $1', 'description = $2', 'difficulty = $3', 'allergens = $4', 
            'time = $5', 'calories = $6', 'ingredients = $7', 'steps = $8', 'category_id = $9'
        ];
        
        const values: any[] = [
            recipe.title, recipe.description || null, recipe.difficulty || null, 
            recipe.allergens || null, recipe.time || null, recipe.calories || null,
            recipe.ingredients, recipe.steps, recipe.category_id
        ];

        let paramCount = 10;
        if (recipe.image_url) {
            setClauses.push(`image_url = $${paramCount}`);
            values.push(recipe.image_url);
            paramCount++;
        }

        if (isAdmin && recipe.is_official !== undefined) {
            setClauses.push(`is_official = $${paramCount}`);
            values.push(recipe.is_official);
            paramCount++;
        }

        const idPos = paramCount;
        const userPos = paramCount + 1;
        
        const finalQuery = `
            UPDATE recipes 
            SET ${setClauses.join(', ')}
            ${isAdmin ? `WHERE id = $${idPos}` : `WHERE id = $${idPos} AND author_id = $${userPos}`}
            RETURNING *
        `;

        values.push(id);
        if (!isAdmin) {
            values.push(userId);
        }

        const result = await pool.query(finalQuery, values);
        return result.rows[0];
    }

    async deleteRecipe(id: number) {
        await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
    }
}
