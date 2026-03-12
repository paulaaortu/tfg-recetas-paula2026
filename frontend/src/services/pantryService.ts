const API_URL = 'http://localhost:3001/api/pantry';

export const getPantryItems = async () => {
    const response = await fetch(API_URL, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener la despensa');
    }

    return await response.json();
};

export const addPantryItem = async (ingredient_name: string, quantity: number | null, unit: string | null) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ingredient_name, quantity, unit }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al añadir ingrediente');
    }

    return await response.json();
};

export const deletePantryItem = async (id: number) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar ingrediente');
    }

    return await response.json();
};
