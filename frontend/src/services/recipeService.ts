const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class RecipeService {
    async getAllRecipes(official?: boolean) {
        let url = `${apiUrl}/api/recipes`;
        if (official !== undefined) {
            url += `?official=${official}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener recetas: ${response.statusText}`);
        }
        return response.json();
    }
}
