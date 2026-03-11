import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, Clock } from 'lucide-react';
import { RecipeService } from '../services/recipeService';
import type { Recipe } from '../types/recipes';
import './Search.css';

export default function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [activeCategory, setActiveCategory] = useState('Ver todo');
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const recipeService = new RecipeService();
    const navigate = useNavigate();

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
                const data = await recipeService.getAllRecipes(true, searchTerm, activeCategory);
                setFilteredRecipes(data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        };
        fetchRecipes();
    }, [searchTerm, activeCategory]);

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
                    <button className="filter-button">
                        <SlidersHorizontal size={20} />
                        <span className="filter-badge">2</span>
                    </button>
                </div>
            </div>

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
                {filteredRecipes.map(recipe => (
                    <div key={recipe.id} className="search-recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                        <img src={recipe.image_url} alt={recipe.title} className="card-image" />
                        <div className="card-info">
                            <h3>{recipe.title}</h3>
                            <div className="card-meta">
                                <Clock className="clock-icon" />
                                <span>{recipe.time} min</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
