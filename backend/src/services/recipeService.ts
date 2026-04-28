import { pool } from "../db";

export class RecipeService {
    async getAllRecipes(official?: string, search?: string, category?: string, strictPantry?: string, userId?: number, difficulty?: string, maxIngredients?: number, maxTime?: number, maxCalories?: number) {
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

        if (difficulty && difficulty !== 'undefined') {
            params.push(difficulty);
            conditions.push(`r.difficulty = $${params.length}`);
        }

        if (maxIngredients && !isNaN(maxIngredients)) {
            params.push(maxIngredients);
            conditions.push(`array_length(string_to_array(r.ingredients, ','), 1) <= $${params.length}`);
        }

        if (maxTime && !isNaN(maxTime)) {
            params.push(maxTime);
            conditions.push(`r.time <= $${params.length}`);
        }

        if (maxCalories && !isNaN(maxCalories)) {
            params.push(maxCalories);
            conditions.push(`r.calories <= $${params.length}`);
        }

        if (strictPantry === 'true' && userId) {
            params.push(userId);
            const userIdParam = `$${params.length}`;
            conditions.push(`
                NOT EXISTS (
                    SELECT unnest_ing 
                    FROM unnest(string_to_array(r.ingredients, ',')) AS unnest_ing
                    WHERE TRIM(unnest_ing) <> '' AND NOT EXISTS (
                        SELECT 1 FROM pantry p 
                        WHERE p.user_id = ${userIdParam}
                        AND (TRIM(unnest_ing) ILIKE '%' || p.ingredient_name || '%' 
                             OR p.ingredient_name ILIKE '%' || TRIM(unnest_ing) || '%')
                    )
                )
            `);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY r.created_at DESC";

        const result = await pool.query(query, params);
        return result.rows;
    }

    async getRecommendedRecipes(userId: number) {
        const [objectivesRes, allergiesRes, sportsRes] = await Promise.all([
            pool.query(
                `SELECT o.name FROM objectives o
                 JOIN user_objectives uo ON o.id = uo.objective_id
                 WHERE uo.user_id = $1`,
                [userId]
            ),
            pool.query(
                `SELECT a.name FROM allergies a
                 JOIN user_allergies ua ON a.id = ua.allergy_id
                 WHERE ua.user_id = $1`,
                [userId]
            ),
            pool.query(
                `SELECT s.name FROM sports s
                 JOIN user_sports us ON s.id = us.sport_id
                 WHERE us.user_id = $1`,
                [userId]
            ),
        ]);

        const userObjectives = objectivesRes.rows.map((r: any) => r.name.toLowerCase());
        const userAllergies = allergiesRes.rows.map((r: any) => r.name.toLowerCase());
        const userSports = sportsRes.rows.map((r: any) => r.name.toLowerCase());

        let query = `
            SELECT r.*, c.name as category_name, u.username as author_name
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.is_official = true
        `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (userAllergies.length > 0) {
            userAllergies.forEach((allergy: string) => {
                params.push(`%${allergy}%`);
                conditions.push(`(r.allergens IS NULL OR LOWER(r.allergens) NOT LIKE $${params.length})`);
            });
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        const wantsToLoseWeight = userObjectives.some((obj: string) =>
            obj.includes('adelgazar') || obj.includes('perder')
        );

        const needsHighProtein = userSports.some((s: string) =>
            s.includes('musculación') || s.includes('musculacion') || s.includes('crossfit')
        );

        const needsHighEnergy = userSports.some((s: string) =>
            s.includes('running') || s.includes('ciclismo')
        );

        const prefersLight = userSports.some((s: string) =>
            s.includes('yoga')
        );

        // Objetivo "Adelgazar" siempre prevalece sobre el deporte
        if (wantsToLoseWeight) {
            query += ` ORDER BY CASE WHEN r.calories IS NULL THEN 9999 ELSE r.calories END ASC`;
        } else if (needsHighProtein) {
            // Musculación / Crossfit: priorizar recetas con ingredientes proteicos
            query += `
                ORDER BY CASE
                    WHEN LOWER(r.ingredients) SIMILAR TO '%(pollo|pechuga|ternera|carne|atún|atun|salmon|salmón|huevo|legumbre|lenteja|garbanzo|proteína|proteina|tofu|queso)%'
                    THEN 0 ELSE 1
                END ASC, r.calories DESC NULLS LAST`;
        } else if (needsHighEnergy) {
            // Running / Ciclismo: más calorías primero (reponer energía)
            query += ` ORDER BY CASE WHEN r.calories IS NULL THEN 0 ELSE r.calories END DESC`;
        } else if (prefersLight) {
            // Yoga: recetas ligeras, menos calorías
            query += ` ORDER BY CASE WHEN r.calories IS NULL THEN 9999 ELSE r.calories END ASC`;
        } else {
            // Natación / Ninguno / sin deporte: más recientes
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
            recipe.time !== undefined ? recipe.time : null,
            recipe.calories !== undefined ? recipe.calories : null,
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
            recipe.allergens || null, 
            recipe.time !== undefined ? recipe.time : null, 
            recipe.calories !== undefined ? recipe.calories : null,
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
