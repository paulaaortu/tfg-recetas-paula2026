import { useEffect, useState } from 'react'
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
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('Ver todo')
    const [strictPantry, setStrictPantry] = useState(false)
    const [pantryCount, setPantryCount] = useState(0)
    const [loadingRecommended, setLoadingRecommended] = useState(false)
    const recipeService = new RecipeService()

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

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                // If searching or filtering by category, disable strictPantry
                if (searchTerm || activeCategory !== 'Ver todo') {
                    setStrictPantry(false);
                }
                const data = await recipeService.getAllRecipes(true, searchTerm, activeCategory, strictPantry)
                setRecipes(data)
            } catch (error) {
                console.error('Error al cargar recetas:', error)
            }
        }
        fetchRecipes()
    }, [searchTerm, activeCategory, strictPantry])

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

    // Show recommendations section only when not searching/filtering
    const showRecommendations = !!userName && !searchTerm && activeCategory === 'Ver todo' && !strictPantry

    return (
        <div className="contenedor-principal">
            <div>
                <div className="bienvenida">
                    <h1 className="name-underline">
                        {userName ? `Hola, ` : 'Bienvenido'}
                        <span>{userName}</span>
                    </h1>
                    <p className="subtitulo">¿Qué cocinamos hoy?</p>
                </div>

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
                    <button onClick={() => setSearchTerm(searchTerm)}>Buscar</button>
                </div>

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

                <div className="ordenador">
                    <div>
                        {!searchTerm && activeCategory === 'Ver todo' && !strictPantry && userName && (
                            <PantryCard
                                pantryCount={pantryCount}
                                onViewRecipes={() => setStrictPantry(true)}
                            />
                        )}

                        {/* RECOMENDACIONES PERSONALIZADAS */}
                        {showRecommendations && (
                            <section style={{ marginBottom: '30px' }}>
                                <div className="titulo">
                                    <h2>✨ Recomendaciones para ti</h2>
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
                        <section>
                            <div className="titulo">
                                <h2>
                                    {strictPantry
                                        ? 'Recetas con lo que tienes'
                                        : (searchTerm || activeCategory !== 'Ver todo'
                                            ? 'Resultados de búsqueda'
                                            : (showRecommendations ? 'Explorar recetas' : (userName ? 'Recomendaciones' : 'Nuestras Recetas')))}
                                </h2>
                                {!searchTerm && activeCategory === 'Ver todo' && !strictPantry && (
                                    <span className="see-all">Ver todas</span>
                                )}
                                {strictPantry && (
                                    <span className="see-all" onClick={() => setStrictPantry(false)} style={{ cursor: 'pointer', color: 'red' }}>Limpiar</span>
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
                                                : (searchTerm
                                                    ? `No se encontraron recetas para "${searchTerm}"`
                                                    : "No hay recetas disponibles en este momento.")
                                            }
                                        </p>
                                        {strictPantry && (
                                            <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>
                                                Prueba a añadir más alimentos a tu despensa o limpia el filtro.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;