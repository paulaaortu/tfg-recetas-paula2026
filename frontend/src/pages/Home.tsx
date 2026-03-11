import { useEffect, useState } from 'react'
import PantryCard from '../components/PantryCard'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import './Home.css'

function Home() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
    const [userName, setUserName] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('Ver todo')
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
                const data = await recipeService.getAllRecipes(true, searchTerm, activeCategory)
                setRecipes(data)
            } catch (error) {
                console.error('Error al cargar recetas:', error)
            }
        }
        fetchRecipes()
    }, [searchTerm, activeCategory])

    useEffect(() => {
        //usuario de localStorage
        const usuario = localStorage.getItem('user')
        if (usuario) {
            try {
                const user = JSON.parse(usuario)
                setUserName(user.username)
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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        {!searchTerm && activeCategory === 'Ver todo' && userName && (
                            <PantryCard
                                pantryCount={16}
                                onViewRecipes={() => console.log('Ver recetas')}
                            />
                        )}

                        <section>
                            <div className="titulo">
                                <h2>
                                    {searchTerm || activeCategory !== 'Ver todo'
                                        ? 'Resultados de búsqueda'
                                        : (userName ? 'Recomendaciones' : 'Nuestras Recetas')}
                                </h2>
                                {!searchTerm && activeCategory === 'Ver todo' && (
                                    <span className="see-all">Ver todas</span>
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