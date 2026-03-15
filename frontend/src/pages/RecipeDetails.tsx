import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Loader2, Tag, AlertTriangle, Activity } from 'lucide-react';
import { RecipeService } from '../services/recipeService';
import type { Recipe } from '../types/recipes';
import './RecipeDetails.css';

export default function RecipeDetails() {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const recipeService = new RecipeService();

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await recipeService.getRecipeById(parseInt(id));
                setRecipe(data);
            } catch (err: any) {
                console.error('Error fetching recipe details:', err);
                setError('No se pudo cargar la receta. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id]);

    if (loading) {
        return (
            <div className="contenedor-detalles">
                <div className="loading-contenedor">
                    <Loader2 className="animate-spin" size={40} />
                    <p>Cargando receta...</p>
                </div>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="contenedor-detalles">
                <div className="error-contenedor">
                    <p>{error || 'Receta no encontrada'}</p>
                </div>
            </div>
        );
    }

    // Extraer Dificultad y Alérgenos si fueron inyectados en la descripción (como en las recetas de la comunidad).
    const descriptionLines = recipe.description ? recipe.description.split('\n') : [];
    let cleanDescription = '';
    let difficulty = '';
    let allergens = '';

    descriptionLines.forEach(line => {
        if (line.startsWith('Dificultad:')) {
            difficulty = line.replace('Dificultad:', '').trim();
        } else if (line.startsWith('Alérgenos:')) {
            allergens = line.replace('Alérgenos:', '').trim();
        } else {
            cleanDescription += line + '\n';
        }
    });
    cleanDescription = cleanDescription.trim();

    return (
        <div className="contenedor-detalles">
            <div className="detalles-contenido">
                <h2>{recipe.title}</h2>
                <div className='info-receta'>
                    <div className="bloque-izquierdo-escritorio">
                        <img src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'} alt={recipe.title} />

                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                            <div className="info-basica" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <small style={{ fontSize: '10px', color: '#6a8770', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>Tiempo</small>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock size={16} />
                                    <span>{recipe.time} min</span>
                                </div>
                            </div>
                            {recipe.category_name && (
                                <div className="info-basica" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <small style={{ fontSize: '10px', color: '#6a8770', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>Categoría</small>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Tag size={16} />
                                        <span>{recipe.category_name}</span>
                                    </div>
                                </div>
                            )}
                            {difficulty && (
                                <div className="info-basica" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <small style={{ fontSize: '10px', color: '#6a8770', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>Dificultad</small>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Activity size={16} />
                                        <span>{difficulty}</span>
                                    </div>
                                </div>
                            )}
                            {allergens && allergens !== 'Ninguno' && (
                                <div className="info-basica" style={{ color: '#d9534f', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <small style={{ fontSize: '10px', color: '#d9534f', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>Alérgenos</small>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <AlertTriangle size={16} />
                                        <span>{allergens}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="divisor-seccion mobile-only" />

                    <div className="bloque-derecho-escritorio">
                        <div className="receta-seccion">
                            <h2>Ingredientes</h2>
                            <ul>
                                {recipe.ingredients.split(/[,\n;.]+/).map((ing, index) => {
                                    const trimmedIng = ing.trim();
                                    if (!trimmedIng) return null;
                                    return <li key={index}>{trimmedIng}</li>;
                                })}
                            </ul>
                        </div>

                        <div className="divisor-seccion" />

                        <div className="receta-seccion">
                            <h2>Pasos a seguir</h2>
                            <div className="pasos-texto">
                                {recipe.steps}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
