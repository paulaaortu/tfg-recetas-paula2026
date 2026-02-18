const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';


export async function getRecipes() {
    const response = await fetch(`${API_BASE_URL}/api/recipes`);
    if (!response.ok) {
        throw new Error(`Error al obtener recetas: ${response.statusText}`);
    }
    return response.json();
}
