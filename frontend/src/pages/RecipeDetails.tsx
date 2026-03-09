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
                <div className="loading-container">
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
                <div className="error-container">
                    <p>{error || 'Receta no encontrada'}</p>
                    <button className="btn-volver" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} /> Volver
                    </button>
                </div>
                <Menu activeTab="inicio" onChange={handleTabChange} />
            </div>
        );
    }

    return (
        <div className="contenedor-detalles">
            <Header activeTab="inicio" onTabChange={handleTabChange} />

            <div className="detalles-contenido">
                <button className="btn-volver" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} /> Volver
                </button>

                <div className="receta-imagen-container">
                    <img src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'} alt={recipe.title} />
                </div>

                <div className="receta-info-principal">
                    <h1>{recipe.title}</h1>
                    <div className="receta-meta">
                        <div className="meta-item">
                            <Clock size={18} />
                            <span>{recipe.time} min</span>
                        </div>
                    </div>
                    <p style={{ marginTop: '15px', color: '#555', lineHeight: '1.5' }}>{recipe.description}</p>
                </div>

                <div className="receta-seccion">
                    <h2>Ingredientes</h2>
                    <ul className="ingredientes-lista">
                        {recipe.ingredients.split('\n').map((ing, index) => (
                            <li key={index}>{ing}</li>
                        ))}
                    </ul>
                </div>

                <div className="receta-seccion">
                    <h2>Pasos a seguir</h2>
                    <div className="pasos-texto">
                        {recipe.steps}
                    </div>
                </div>
            </div>

            <Menu activeTab="inicio" onChange={handleTabChange} />
        </div>
    );
}
