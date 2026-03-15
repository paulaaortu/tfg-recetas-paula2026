import { useEffect, useState } from 'react'
import PantryCard from '../components/PantryCard'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import { getPantryItems } from '../services/pantryService'
import type { Recipe } from '../types/recipes'
import './Home.css'

function Home() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
    const [userName, setUserName] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('Ver todo')
    const [strictPantry, setStrictPantry] = useState(false)
    const [pantryCount, setPantryCount] = useState(0)
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
        //usuario de localStorage
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
            } catch (error) {
                console.error('Error cargando usuario de localStorage', error)
            }
        }
    }, [])

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

                        <section>
                            <div className="titulo">
                                <h2>
                                    {strictPantry
                                        ? 'Recetas con lo que tienes en la despensa'
                                        : (searchTerm || activeCategory !== 'Ver todo'
                                            ? 'Resultados de búsqueda'
                                            : (userName ? 'Recomendaciones' : 'Nuestras Recetas'))}
                                </h2>
                                {!searchTerm && activeCategory === 'Ver todo' && !strictPantry && (
                                    <span className="see-all">Ver todas</span>
                                )}
                                {strictPantry && (
                                    <span className="see-all" onClick={() => setStrictPantry(false)} style={{cursor: 'pointer', color: 'red'}}>Limpiar filtro</span>
                                )}
                            </div>

                            <div className="grid-recetas">
                                {recipes.map((recipe) => (
                                    <CardRecipes key={recipe.id} recipe={recipe} />
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;