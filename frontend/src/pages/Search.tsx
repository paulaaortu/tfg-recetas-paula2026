import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, Clock, X, SignalLow, SignalMedium, SignalHigh, Utensils, RotateCcw, Check } from 'lucide-react';
import { RecipeService, getImageUrl } from '../services/recipeService';
import type { Recipe } from '../types/recipes';
import './Search.css';

export default function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [activeCategory, setActiveCategory] = useState('Ver todo');
    const [difficulty, setDifficulty] = useState<string>('');
    const [maxIngredients, setMaxIngredients] = useState<number | undefined>(undefined);
    const [showFilters, setShowFilters] = useState(false);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const recipeService = new RecipeService();
    const navigate = useNavigate();

    // Bloquear scroll cuando los filtros están abiertos
    useEffect(() => {
        if (showFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showFilters]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await recipeService.getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const data = await recipeService.getAllRecipes(true, searchTerm, activeCategory, false, difficulty, maxIngredients);
                setFilteredRecipes(data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        };
        fetchRecipes();
    }, [searchTerm, activeCategory, difficulty, maxIngredients]);

    const activeFiltersCount = (difficulty ? 1 : 0) + (maxIngredients ? 1 : 0);
    const isSearchingOrFiltering = !!searchTerm || activeCategory !== 'Ver todo' || activeFiltersCount > 0;

    const handleClearFilters = () => {
        setDifficulty('');
        setMaxIngredients(undefined);
    };

    return (
        <div className="search-page">
            <div className="search-container">
                <div className="search-bar-row">
                    <div className="search-input-wrapper">
                        <SearchIcon className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar recetas"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className={`filter-button ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
                        onClick={() => setShowFilters(true)}
                    >
                        <SlidersHorizontal size={22} color="#7a5a68" strokeWidth={2.5} />
                        {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
                    </button>
                </div>
            </div>

            {/* Modal de Filtros */}
            {showFilters && (
                <div className="filter-modal-overlay" onClick={() => setShowFilters(false)}>
                    <div className="filter-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="filter-modal-header">
                            <h3>Filtros avanzados</h3>
                            <button className="close-btn" onClick={() => setShowFilters(false)}>
                                <X size={24} color="#999" />
                            </button>
                        </div>
                        
                        <div className="filter-modal-body">
                            <div className="filter-section">
                                <h4>Dificultad</h4>
                                <div className="filter-options">
                                    {[
                                        { label: 'Baja', icon: <SignalLow size={16} /> },
                                        { label: 'Media', icon: <SignalMedium size={16} /> },
                                        { label: 'Alta', icon: <SignalHigh size={16} /> }
                                    ].map(level => (
                                        <button 
                                            key={level.label}
                                            className={`filter-chip ${difficulty === level.label ? 'active' : ''}`}
                                            onClick={() => setDifficulty(difficulty === level.label ? '' : level.label)}
                                        >
                                            {level.icon}
                                            <span>{level.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-section">
                                <h4>Cantidad de ingredientes</h4>
                                <div className="filter-options">
                                    {[
                                        { label: 'Pocos ingredientes (≤ 5)', value: 5, icon: <Utensils size={16} /> },
                                        { label: 'Normal (≤ 10)', value: 10, icon: <Utensils size={18} /> },
                                        { label: 'Cualquier cantidad', value: undefined, icon: <Utensils size={20} /> }
                                    ].map(option => (
                                        <button 
                                            key={option.label}
                                            className={`filter-chip wide ${maxIngredients === option.value ? 'active' : ''}`}
                                            onClick={() => setMaxIngredients(option.value)}
                                        >
                                            {option.icon}
                                            <span>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="filter-modal-footer">
                            <button className="clear-btn" onClick={handleClearFilters}>
                                <RotateCcw size={18} />
                                Limpiar
                            </button>
                            <button className="apply-btn" onClick={() => setShowFilters(false)}>
                                <Check size={18} />
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="categories-scroll">
                <button
                    key="Ver todo"
                    className={`category-chip ${activeCategory === 'Ver todo' ? 'active' : 'inactive'}`}
                    onClick={() => setActiveCategory('Ver todo')}
                >
                    Ver todo
                </button>
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`category-chip ${activeCategory === category.name ? 'active' : 'inactive'}`}
                        onClick={() => setActiveCategory(category.name)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            <div className="results-grid">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <div key={recipe.id} className="search-recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                            <img src={getImageUrl(recipe.image_url)} alt={recipe.title} className="card-image" />
                            <div className="card-info">
                                <h3>{recipe.title}</h3>
                                <div className="card-meta">
                                    <Clock className="clock-icon" />
                                    <span>{recipe.time} min</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results" style={{ gridColumn: '1 / -1' }}>
                        <p>
                            {isSearchingOrFiltering
                                ? "No se han encontrado recetas con esas características."
                                : "No hay recetas disponibles en este momento."}
                        </p>
                        {isSearchingOrFiltering && (
                            <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>
                                Prueba a cambiar los filtros o a realizar otra búsqueda.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
