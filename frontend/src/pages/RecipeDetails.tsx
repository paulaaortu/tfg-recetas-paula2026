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

    // Decode JWT to get current user id
    const getCurrentUserId = (): number | null => {
        if (!token) return null;
        try {
            const cleanToken = token.replace(/^"|"$/g, '');
            const payload = JSON.parse(atob(cleanToken.split('.')[1]));
            return payload.id ?? payload.userId ?? payload.sub ?? null;
        } catch {
            return null;
        }
    };
    const currentUserId = getCurrentUserId();

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
                <div className="layout-receta">
                    {/* LADO IZQUIERDO: Imagen */}
                    <div className="lado-imagen">
                        <img src={getImageUrl(recipe.image_url)} alt={recipe.title} />
                    </div>

                    {/* LADO DERECHO: Detalles (Sticky on desktop) */}
                    <div className="lado-detalles">
                        <header className="detalles-header">
                            <div className="categoria-tag">{recipe.category_name}</div>
                            <div className="titulo-y-favorito">
                                <h1>{recipe.title}</h1>
                                {isLoggedIn && recipe.author_id !== currentUserId && (
                                    <button
                                        onClick={handleToggleFavorite}
                                        disabled={isFavLoading}
                                        className="fav-btn-minimal"
                                        title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                                    >
                                        <Heart
                                            size={24}
                                            color={isFavorite ? "#d9534f" : "#3B3B3B"}
                                            fill={isFavorite ? "#d9534f" : "none"}
                                        />
                                    </button>
                                )}
                            </div>

                            {!recipe.is_official && recipe.author_name && (
                                <p className="autor-nombre">Por <span>{recipe.author_name}</span></p>
                            )}

                            {cleanDescription && <p className="descripcion-corta">{cleanDescription}</p>}
                        </header>

                        <div className="stats-grid-minimal">
                            <div className="stat-box">
                                <Clock size={16} />
                                <span>{recipe.time} min</span>
                            </div>
                            {difficulty && (
                                <div className="stat-box">
                                    <Activity size={16} />
                                    <span>{difficulty}</span>
                                </div>
                            )}
                            {recipe.calories != null && (
                                <div className="stat-box">
                                    <Flame size={16} color="#e67e22" />
                                    <span>{recipe.calories} kcal</span>
                                </div>
                            )}
                            {allergens && allergens !== 'Ninguno' && (
                                <div className="stat-box error-stat">
                                    <AlertTriangle size={16} />
                                    <span>{allergens}</span>
                                </div>
                            )}
                        </div>

                        <div className="secciones-info">
                            <div className="seccion-minimal">
                                <h3>Ingredientes</h3>
                                <ul className="lista-ingredientes">
                                    {recipe.ingredients.split(/[,\n;.]+/).map((ing, index) => {
                                        const trimmedIng = ing.trim();
                                        if (!trimmedIng) return null;
                                        return <li key={index}><span>•</span> {trimmedIng}</li>;
                                    })}
                                </ul>
                            </div>

                            <div className="seccion-minimal">
                                <h3>Preparación</h3>
                                <div className="pasos-texto-minimal">
                                    {recipe.steps}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
