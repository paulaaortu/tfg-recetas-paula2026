import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Menu from '../components/Menu';
import { RecipeService } from '../services/recipeService';
import type { Recipe } from '../types/recipes';
import './RecipeDetails.css';

export default function RecipeDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
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

    const handleTabChange = (tab: string) => {
        if (tab === 'inicio') navigate('/');
        if (tab === 'social') navigate('/social');
        if (tab === 'perfil') {
            const hasSession = localStorage.getItem('user');
            navigate(hasSession ? '/perfil' : '/login');
        }
    };

    if (loading) {
        return (
            <div className="contenedor-detalles">
                <Header activeTab="inicio" onTabChange={handleTabChange} />
                <div className="loading-contenedor">
                    <Loader2 className="animate-spin" size={40} />
                    <p>Cargando receta...</p>
                </div>
                <Menu activeTab="inicio" onChange={handleTabChange} />
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="contenedor-detalles">
                <Header activeTab="inicio" onTabChange={handleTabChange} />
                <div className="error-contenedor">
                    <p>{error || 'Receta no encontrada'}</p>
                </div>
                <Menu activeTab="inicio" onChange={handleTabChange} />
            </div>
        );
    }

    return (
        <div className="contenedor-detalles">
            <Header activeTab="inicio" onTabChange={handleTabChange} />

            <div className="detalles-contenido">
                <h2>{recipe.title}</h2>
                <div className='info-receta'>
                    <div className="bloque-izquierdo-escritorio">
                        <img src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'} alt={recipe.title} />

                        <span><strong>{recipe.description}</strong></span>
                        <div className="info-basica">
                            <div>
                                <Clock size={18} />
                                <span>{recipe.time} min</span>
                            </div>
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

            <Menu activeTab="inicio" onChange={handleTabChange} />
        </div>
    );
}
