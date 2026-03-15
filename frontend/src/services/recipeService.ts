const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class RecipeService {
    async getAllRecipes(official?: boolean, search?: string, category?: string, strictPantry?: boolean) {
        let url = `${apiUrl}/api/recipes?`;
        const params = new URLSearchParams();

        if (official !== undefined) params.append('official', String(official));
        if (search) params.append('search', search);
        if (category && category !== 'Ver todo') params.append('category', category);
        if (strictPantry !== undefined) params.append('strictPantry', String(strictPantry));

        const headers: Record<string, string> = {};
        if (strictPantry) {
            const rawToken = localStorage.getItem('token');
            if (rawToken) {
                const token = rawToken.replace(/^"|"$/g, '');
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(url + params.toString(), { headers });
        if (!response.ok) {
            throw new Error(`Error al obtener recetas: ${response.statusText}`);
        }
        return response.json();
    }
    async getRecipeById(id: number) {
        const response = await fetch(`${apiUrl}/api/recipes/${id}`);
        if (!response.ok) {
            throw new Error(`Error al obtener la receta: ${response.statusText}`);
        }
        return response.json();
    }

    async getCategories() {
        const response = await fetch(`${apiUrl}/api/recipes/categories`);
        if (!response.ok) {
            throw new Error(`Error al obtener categorías: ${response.statusText}`);
        }
        return response.json();
    }

    async getAllAllergens() {
        const response = await fetch(`${apiUrl}/api/recipes/allergens`);
        if (!response.ok) {
            throw new Error(`Error al obtener alérgenos: ${response.statusText}`);
        }
        return response.json();
    }

    async createRecipe(recipeData: FormData) {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};

        if (token) {
            const token2 = token.replace(/^"|"$/g, '');
            headers['Authorization'] = `Bearer ${token2}`;
        }

        const response = await fetch(`${apiUrl}/api/recipes`, {
            method: 'POST',
            headers,
            body: recipeData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al crear receta: ${response.statusText}`);
        }

        return response.json();
    }
}
