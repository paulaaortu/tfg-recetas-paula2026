const API_URL = 'http://localhost:3001/api/admin';

export const getAllUsers = async () => {
    const response = await fetch(`${API_URL}/users`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return await response.json();
};

export const deleteUser = async (id: number) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Error al eliminar usuario');
    return await response.json();
};

export const getAdminRecipes = async (type: 'official' | 'user') => {
    const response = await fetch(`${API_URL}/recipes?type=${type}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Error al obtener recetas');
    return await response.json();
};

export const deleteRecipe = async (id: number) => {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Error al eliminar receta');
    return await response.json();
};
