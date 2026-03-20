import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Loader2, Tag, AlertTriangle, Activity, Heart, Flame } from 'lucide-react';
import { RecipeService, getImageUrl } from '../services/recipeService';
import type { Recipe } from '../types/recipes';
import './RecipeDetails.css';

export default function RecipeDetails() {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isFavLoading, setIsFavLoading] = useState(false);
    const recipeService = new RecipeService();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await recipeService.getRecipeById(parseInt(id));
                setRecipe(data);

                if (isLoggedIn) {
                    const favData = await recipeService.isFavorite(parseInt(id));
                    setIsFavorite(favData.isFavorite);
                }
            } catch (err: any) {
                console.error('Error fetching recipe details:', err);
                setError('No se pudo cargar la receta. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id, isLoggedIn]);

    const handleToggleFavorite = async () => {
        if (!id || !isLoggedIn || isFavLoading) return;
        setIsFavLoading(true);
        try {
            if (isFavorite) {
                await recipeService.removeFavorite(parseInt(id));
                setIsFavorite(false);
            } else {
                await recipeService.addFavorite(parseInt(id));
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsFavLoading(false);
        }
    };

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

    // Use difficulty and allergens from the database directly, fallback if not present
    const cleanDescription = recipe.description || '';
    const difficulty = recipe.difficulty || '';
    const allergens = recipe.allergens || '';

    return (
        <div className="contenedor-detalles">
            <div className="detalles-contenido">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <h2>{recipe.title}</h2>
                    {isLoggedIn && (
                        <button 
                            onClick={handleToggleFavorite}
                            disabled={isFavLoading}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer',
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                outline: 'none'
                            }}
                            title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                        >
                            <Heart 
                                size={28} 
                                color={isFavorite ? "#d9534f" : "#6a8770"} 
                                fill={isFavorite ? "#d9534f" : "none"}
                                style={{ transition: 'all 0.2s' }}
                            />
                        </button>
                    )}
                </div>
                {!recipe.is_official && recipe.author_name && (
                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#6a8770', marginTop: '-5px', marginBottom: '10px' }}>
                        Publicada por <strong>{recipe.author_name}</strong>
                    </p>
                )}
                {cleanDescription && <p className="receta-descripcion-corta">{cleanDescription}</p>}
                
                <div className='info-receta'>
                    <div className="bloque-izquierdo-escritorio">
                        <img src={getImageUrl(recipe.image_url)} alt={recipe.title} />

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
                            {recipe.calories != null && (
                                <div className="info-basica" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <small style={{ fontSize: '10px', color: '#6a8770', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>Calorías</small>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Flame size={16} color="#e67e22" />
                                        <span>{recipe.calories} kcal</span>
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
