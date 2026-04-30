import { useEffect, useState } from 'react'
import { SlidersHorizontal, X, SignalLow, SignalMedium, SignalHigh, Utensils, RotateCcw, Check, Clock, Flame } from 'lucide-react'
import PantryCard from '../components/PantryCard'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import { getPantryItems } from '../services/pantryService'
import type { Recipe } from '../types/recipes'
import './Home.css'

function Home() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([])
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
    const [userName, setUserName] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem('home_searchTerm') || '')
    const [activeCategory, setActiveCategory] = useState(() => sessionStorage.getItem('home_activeCategory') || 'Ver todo')
    const [strictPantry, setStrictPantry] = useState(false)
    const [pantryCount, setPantryCount] = useState(0)
    const [loadingRecommended, setLoadingRecommended] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [difficulty, setDifficulty] = useState<string>(() => sessionStorage.getItem('home_difficulty') || '')
    const [maxIngredients, setMaxIngredients] = useState<number | undefined>(() => {
        const v = sessionStorage.getItem('home_maxIngredients'); return v ? Number(v) : undefined
    })
    const [maxTime, setMaxTime] = useState<number | undefined>(() => {
        const v = sessionStorage.getItem('home_maxTime'); return v ? Number(v) : undefined
    })
    const [maxCalories, setMaxCalories] = useState<number | undefined>(() => {
        const v = sessionStorage.getItem('home_maxCalories'); return v ? Number(v) : undefined
    })
    const recipeService = new RecipeService()

    // Persistir filtros en sessionStorage
    useEffect(() => {
        sessionStorage.setItem('home_searchTerm', searchTerm)
        sessionStorage.setItem('home_activeCategory', activeCategory)
        sessionStorage.setItem('home_difficulty', difficulty)
        if (maxIngredients !== undefined) sessionStorage.setItem('home_maxIngredients', String(maxIngredients))
        else sessionStorage.removeItem('home_maxIngredients')
        if (maxTime !== undefined) sessionStorage.setItem('home_maxTime', String(maxTime))
        else sessionStorage.removeItem('home_maxTime')
        if (maxCalories !== undefined) sessionStorage.setItem('home_maxCalories', String(maxCalories))
        else sessionStorage.removeItem('home_maxCalories')
    }, [searchTerm, activeCategory, difficulty, maxIngredients, maxTime, maxCalories])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await recipeService.getCategories()
                setCategories(data)
            } catch (error) {
                console.error('Error al cargar categorías:', error)
            }
        }
        fetchCategories()
    }, [])

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
        const fetchRecipes = async () => {
            try {
                // If searching or filtering by category, disable strictPantry
                if (searchTerm || activeCategory !== 'Ver todo') {
                    setStrictPantry(false);
                }
                const data = await recipeService.getAllRecipes(true, searchTerm, activeCategory, strictPantry, difficulty, maxIngredients, maxTime, maxCalories)
                setRecipes(data)
            } catch (error) {
                console.error('Error al cargar recetas:', error)
            }
        }
        fetchRecipes()
    }, [searchTerm, activeCategory, strictPantry, difficulty, maxIngredients, maxTime, maxCalories])

    useEffect(() => {
        // usuario de localStorage
        const usuario = localStorage.getItem('user')
        if (usuario) {
            try {
                const user = JSON.parse(usuario)
                setUserName(user.username)

                // Fetch pantry items
                getPantryItems().then(items => {
                    setPantryCount(items.length)
                }).catch(err => {
                    console.error('Error loading pantry count', err)
                })

                // Fetch personalized recommendations
                const fetchRecommended = async () => {
                    setLoadingRecommended(true)
                    try {
                        const data = await recipeService.getRecommendedRecipes()
                        setRecommendedRecipes(data)
                    } catch (err) {
                        console.error('Error cargando recomendaciones:', err)
                    } finally {
                        setLoadingRecommended(false)
                    }
                }
                fetchRecommended()
            } catch (error) {
                console.error('Error cargando usuario de localStorage', error)
            }
        }
    }, [])

    const activeFiltersCount = (difficulty ? 1 : 0) + (maxIngredients ? 1 : 0) + (maxTime ? 1 : 0) + (maxCalories ? 1 : 0);

    const isSearchingOrFiltering = !!searchTerm || activeCategory !== 'Ver todo' || strictPantry || activeFiltersCount > 0;

    // Show recommendations section only when not searching/filtering
    const showRecommendations = !!userName && !isSearchingOrFiltering

    const handleClearFilters = () => {
        setDifficulty('');
        setMaxIngredients(undefined);
        setMaxTime(undefined);
        setMaxCalories(undefined);
    };

    return (
        <div className="contenedor-principal">
            <div>
                <div className="home-header-top">
                    {!isSearchingOrFiltering && (
                        <div className="bienvenida">
                            <h1 className="name-underline">
                                {userName ? `Hola, ` : 'Bienvenido'}
                                <span>{userName}</span>
                            </h1>
                            <p className="subtitulo">¿Qué cocinamos hoy?</p>
                        </div>
                    )}

                    {/* Barra búsqueda desktop */}
                    <div className="barra-busqueda">
                        <input
                            placeholder="Busca una receta, ingrediente o categoría..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                if (strictPantry) setStrictPantry(false)
                            }}
                        />
                        <div className="search-buttons-group">
                            <button onClick={() => setSearchTerm(searchTerm)}>Buscar</button>
                            <button
                                className={`filter-button-home ${activeFiltersCount > 0 ? 'active' : ''}`}
                                onClick={() => setShowFilters(true)}
                                title="Filtros"
                            >
                                <SlidersHorizontal size={22} color="#7a5a68" strokeWidth={2.5} />
                                {activeFiltersCount > 0 && <span className="filter-badge-home">{activeFiltersCount}</span>}
                            </button>
                        </div>
                    </div>
                </div>

                {!isSearchingOrFiltering && (
                    <div className="categories-scroll-home">
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
                )}

                <div className="ordenador">
                    <div>
                        {!isSearchingOrFiltering && userName && (
                            <PantryCard
                                pantryCount={pantryCount}
                                onViewRecipes={() => setStrictPantry(true)}
                            />
                        )}

                        {/* RECOMENDACIONES PERSONALIZADAS */}
                        {showRecommendations && (
                            <section style={{ marginBottom: '30px' }}>
                                <div className="titulo">
                                    <h2>Recomendaciones para ti</h2>
                                </div>
                                {loadingRecommended ? (
                                    <div className="grid-recetas">
                                        <p style={{ opacity: 0.6, gridColumn: '1 / -1' }}>Cargando recomendaciones...</p>
                                    </div>
                                ) : recommendedRecipes.length > 0 ? (
                                    <div className="grid-recetas">
                                        {recommendedRecipes.map((recipe) => (
                                            <CardRecipes key={recipe.id} recipe={recipe} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid-recetas">
                                        <p style={{ opacity: 0.6, gridColumn: '1 / -1' }}>
                                            Configura tus preferencias en el perfil para ver recomendaciones personalizadas.
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* TODAS LAS RECETAS / BÚSQUEDA */}
                        <section style={{ marginTop: isSearchingOrFiltering ? '20px' : '0' }}>
                            <div className="titulo">
                                <h2>
                                    {strictPantry
                                        ? 'Recetas con lo que tienes'
                                        : (isSearchingOrFiltering
                                            ? `Resultados (${recipes.length})`
                                            : (userName ? 'Explorar recetas' : 'Nuestras Recetas'))}
                                </h2>
                                {isSearchingOrFiltering && (
                                    <span
                                        className="see-all"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setActiveCategory('Ver todo');
                                            setStrictPantry(false);
                                            handleClearFilters();
                                        }}
                                        style={{ cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold' }}
                                    >
                                        Limpiar filtros
                                    </span>
                                )}
                            </div>

                            <div className="grid-recetas">
                                {recipes.length > 0 ? (
                                    recipes.map((recipe) => (
                                        <CardRecipes key={recipe.id} recipe={recipe} />
                                    ))
                                ) : (
                                    <div className="no-results" style={{ gridColumn: '1 / -1' }}>
                                        <p>
                                            {strictPantry
                                                ? "Vaya, parece que no tienes ingredientes suficientes para ninguna de nuestras recetas."
                                                : (isSearchingOrFiltering
                                                    ? "No se han encontrado recetas con esas características."
                                                    : "No hay recetas disponibles en este momento.")
                                            }
                                        </p>
                                        {isSearchingOrFiltering && (
                                            <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>
                                                Prueba a cambiar los filtros o a realizar otra búsqueda.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Modal de Filtros (Reutilizando lógica de Search.tsx) */}
            {showFilters && (
                <div className="filter-modal-overlay" onClick={() => setShowFilters(false)}>
                    <div className="filter-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="recipe-filter-modal-header">
                            <h3>Filtros avanzados</h3>
                            <button className="filter-modal-close-btn" onClick={() => setShowFilters(false)}>
                                <X size={24} color="#666" />
                            </button>
                        </div>

                        <div className="filter-modal-body">
                            <div className="filter-section">
                                <h4>Dificultad</h4>
                                <div className="filter-options">
                                    {[
                                        { label: 'Fácil', icon: <SignalLow size={16} /> },
                                        { label: 'Media', icon: <SignalMedium size={16} /> },
                                        { label: 'Difícil', icon: <SignalHigh size={16} /> }
                                    ].map(level => (
                                        <button
                                            key={level.label}
                                            className={`filter-chip-modal ${difficulty === level.label ? 'active' : ''}`}
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
                                            className={`filter-chip-modal wide ${maxIngredients === option.value ? 'active' : ''}`}
                                            onClick={() => setMaxIngredients(option.value)}
                                        >
                                            {option.icon}
                                            <span>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-section">
                                <h4>Tiempo de preparación</h4>
                                <div className="filter-options">
                                    {[
                                        { label: '≤ 15 min', value: 15, icon: <Clock size={16} /> },
                                        { label: '≤ 30 min', value: 30, icon: <Clock size={16} /> },
                                        { label: '≤ 60 min', value: 60, icon: <Clock size={16} /> },
                                        { label: 'Cualquier tiempo', value: undefined, icon: <Clock size={16} /> },
                                    ].map(option => (
                                        <button
                                            key={option.label}
                                            className={`filter-chip-modal ${maxTime === option.value ? 'active' : ''}`}
                                            onClick={() => setMaxTime(option.value)}
                                        >
                                            {option.icon}
                                            <span>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-section">
                                <h4>Calorías máximas</h4>
                                <div className="filter-options">
                                    {[
                                        { label: '≤ 300 kcal', value: 300, icon: <Flame size={16} /> },
                                        { label: '≤ 600 kcal', value: 600, icon: <Flame size={16} /> },
                                        { label: 'Sin límite', value: undefined, icon: <Flame size={16} /> },
                                    ].map(option => (
                                        <button
                                            key={option.label}
                                            className={`filter-chip-modal ${maxCalories === option.value ? 'active' : ''}`}
                                            onClick={() => setMaxCalories(option.value)}
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
        </div>
    )
}

export default Home;