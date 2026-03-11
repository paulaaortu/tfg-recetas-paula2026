const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class RecipeService {
    async getAllRecipes(official?: boolean, search?: string, category?: string) {
        let url = `${apiUrl}/api/recipes?`;
        const params = new URLSearchParams();

        if (official !== undefined) params.append('official', String(official));
        if (search) params.append('search', search);
        if (category && category !== 'Ver todo') params.append('category', category);

        const response = await fetch(url + params.toString());
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
}
