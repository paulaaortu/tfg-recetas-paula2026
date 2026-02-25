const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class RecipeService {
    async getAllRecipes() {
        const response = await fetch(`${apiUrl}/api/recipes`);
        if (!response.ok) {
            throw new Error(`Error al obtener recetas: ${response.statusText}`);
        }
        return response.json();
    }
}
