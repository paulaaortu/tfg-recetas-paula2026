export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getImageUrl = (url: string | undefined | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
    if (url.startsWith('http')) return url;
    return `${apiUrl}${url}`;
};

export class RecipeService {
    async getAllRecipes(official?: boolean, search?: string, category?: string, strictPantry?: boolean, difficulty?: string, maxIngredients?: number) {
        let url = `${apiUrl}/api/recipes?`;
        const params = new URLSearchParams();

        if (official !== undefined) params.append('official', String(official));
        if (search) params.append('search', search);
        if (category && category !== 'Ver todo') params.append('category', category);
        if (strictPantry !== undefined) params.append('strictPantry', String(strictPantry));
        if (difficulty) params.append('difficulty', difficulty);
        if (maxIngredients) params.append('maxIngredients', String(maxIngredients));

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

    async getRecommendedRecipes() {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${apiUrl}/api/recipes/recommended`, { headers });
        if (!response.ok) throw new Error('Error al obtener recomendaciones');
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

    async getMyRecipes() {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${apiUrl}/api/recipes/my-recipes`, { headers });
        if (!response.ok) throw new Error('Error al obtener mis recetas');
        return response.json();
    }

    async getFavorites() {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${apiUrl}/api/recipes/favorites`, { headers });
        if (!response.ok) throw new Error('Error al obtener favoritos');
        return response.json();
    }

    async addFavorite(id: number) {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${apiUrl}/api/recipes/${id}/favorite`, { method: 'POST', headers });
        if (!response.ok) throw new Error('Error al añadir favorito');
        return response.json();
    }

    async removeFavorite(id: number) {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${apiUrl}/api/recipes/${id}/favorite`, { method: 'DELETE', headers });
        if (!response.ok) throw new Error('Error al eliminar favorito');
        return response.json();
    }

    async isFavorite(id: number) {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`${apiUrl}/api/recipes/${id}/is-favorite`, { headers });
        if (!response.ok) throw new Error('Error al verificar favorito');
        return response.json();
    }

    async updateRecipe(id: number, recipeData: FormData) {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${apiUrl}/api/recipes/${id}`, {
            method: 'PUT',
            headers,
            body: recipeData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al actualizar receta: ${response.statusText}`);
        }

        return response.json();
    }
}
