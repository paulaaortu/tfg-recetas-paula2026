import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Loader2, Tag, AlertTriangle, Activity, Heart, Flame, Trash2 } from 'lucide-react';
import { RecipeService, getImageUrl } from '../services/recipeService';
import type { Recipe } from '../types/recipes';
import ConfirmModal from '../components/ConfirmModal';
import './RecipeDetails.css';

export default function RecipeDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isFavLoading, setIsFavLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    const getIsAdmin = (): boolean => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.is_admin === true;
            }
        } catch { return false; }
        return false;
    };
    const isAdmin = getIsAdmin();

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


    const handleDeleteRecipe = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteRecipe = async () => {
        try {
            await recipeService.deleteRecipe(recipe!.id);
            // Redirigir a Home tras eliminar con éxito
            navigate('/');
        } catch (err) {
            console.error('Error al eliminar la receta:', err);
            alert('No se pudo eliminar la receta.');
            setIsDeleteModalOpen(false);
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
                        <div className="main-image-container">
                            <img src={getImageUrl(recipe.image_url)} alt={recipe.title} className="principal-img" />
                            
                            {/* Botón Guardar flotante */}
                            {isLoggedIn && (
                                <button 
                                    className={`floating-save-btn ${isFavorite ? 'active' : ''}`}
                                    onClick={handleToggleFavorite}
                                    disabled={isFavLoading}
                                >
                                    <Heart size={18} fill={isFavorite ? "white" : "none"} />
                                    <span>{isFavorite ? 'Guardada' : 'Guardar receta'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* LADO DERECHO: Detalles */}
                    <div className="lado-detalles">
                        <header className="detalles-header">
                            <div className="header-top-row">
                                <div className="categoria-tag">{recipe.category_name}</div>
                                <div className="header-actions">
                                    {isLoggedIn && (recipe.author_id === currentUserId || isAdmin) && (
                                        <button
                                            onClick={handleDeleteRecipe}
                                            className="action-circle-btn delete-btn-new"
                                            title="Eliminar receta"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="titulo-principal">
                                <h1>{recipe.title}</h1>
                            </div>

                            {!recipe.is_official && recipe.author_name && (
                                <p className="autor-nombre">Por <span>{recipe.author_name}</span></p>
                            )}

                            {cleanDescription && <p className="descripcion-corta">{cleanDescription}</p>}
                        </header>

                        <div className="stats-cards-row">
                            <div className="stat-card">
                                <Clock size={20} />
                                <div className="stat-info">
                                    <span className="stat-value">{recipe.time} min</span>
                                    <span className="stat-label">Tiempo total</span>
                                </div>
                            </div>
                            {difficulty && (
                                <div className="stat-card">
                                    <Activity size={20} />
                                    <div className="stat-info">
                                        <span className="stat-value">{difficulty}</span>
                                        <span className="stat-label">Dificultad</span>
                                    </div>
                                </div>
                            )}
                            {recipe.calories != null && (
                                <div className="stat-card">
                                    <Flame size={20} />
                                    <div className="stat-info">
                                        <span className="stat-value">{recipe.calories} kcal</span>
                                        <span className="stat-label">Por ración</span>
                                    </div>
                                </div>
                            )}
                            {allergens && allergens !== 'Ninguno' && (
                                <div className="stat-card danger">
                                    <AlertTriangle size={20} />
                                    <div className="stat-info">
                                        <span className="stat-value">{allergens}</span>
                                        <span className="stat-label">Alérgeno</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid-info-receta single-card-layout">
                            <div className="card-info-blanca unified-card">
                                <div className="grid-two-columns">
                                    <div className="columna-ingredientes">
                                        <div className="card-header">
                                            <Tag size={20} />
                                            <h3>INGREDIENTES</h3>
                                        </div>
                                        <ul className="lista-ingredientes-nueva">
                                            {recipe.ingredients.split(/[,\n;]+/).map((ing, index) => {
                                                const cleanedIng = ing.replace(/^[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+/, '').trim();
                                                if (!cleanedIng) return null;
                                                return (
                                                    <li key={index}>
                                                        <span className="nombre-ing">{cleanedIng}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>

                                    <div className="columna-preparacion">
                                        <div className="card-header">
                                            <Activity size={20} />
                                            <h3>PREPARACIÓN</h3>
                                        </div>
                                        <div className="pasos-numerados">
                                            {recipe.steps.split('\n').filter(p => p.trim()).map((paso, index) => (
                                                <div key={index} className="paso-item">
                                                    <p>{paso.trim()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Eliminar receta"
                message="¿Estás seguro de que deseas eliminar esta receta? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={confirmDeleteRecipe}
                onCancel={() => setIsDeleteModalOpen(false)}
                isDanger={true}
            />
        </div>
    );
}
