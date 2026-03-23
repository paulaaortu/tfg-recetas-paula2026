import { apiUrl } from './recipeService';

export interface UserPreferences {
    objectives: { id: number; name: string; description?: string }[];
    sports: { id: number; name: string }[];
    allergies: { id: number; name: string }[];
}

export interface PreferencesCatalog {
    objectives: { id: number; name: string; description?: string }[];
    sports: { id: number; name: string }[];
    allergies: { id: number; name: string }[];
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function getPreferencesCatalog(): Promise<PreferencesCatalog> {
    const response = await fetch(`${apiUrl}/api/profile/catalog`);
    if (!response.ok) throw new Error('Error cargando el catálogo de preferencias');
    return response.json();
}

export async function getUserPreferences(): Promise<UserPreferences> {
    const headers = getAuthHeaders();
    const response = await fetch(`${apiUrl}/api/profile/preferences`, { headers });
    if (!response.ok) throw new Error('Error cargando preferencias del usuario');
    return response.json();
}

export async function saveUserPreferences(data: {
    objective_ids: number[];
    sport_ids: number[];
    allergy_ids: number[];
}): Promise<UserPreferences> {
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    const response = await fetch(`${apiUrl}/api/profile/preferences`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error guardando preferencias');
    return response.json();
}
