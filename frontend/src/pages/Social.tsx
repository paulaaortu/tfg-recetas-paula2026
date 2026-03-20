import { useEffect, useState } from 'react'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import LoginOverlay from '../components/LoginOverlay'
import './Home.css' // Reuse Home styles for consistency
import './Social.css'

function Social() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [search, setSearch] = useState('')
    const recipeService = new RecipeService()
    const navigate = useNavigate()

    // Check session
    const user = localStorage.getItem('user')
    const isLoggedIn = !!user

    useEffect(() => {
        if (isLoggedIn) {
            const fetchRecipes = async () => {
                try {
                    const data = await recipeService.getAllRecipes(false)
                    setRecipes(data)
                } catch (error) {
                    console.error('Error al cargar recetas sociales:', error)
                }
            }
            fetchRecipes()
        }
    }, [isLoggedIn])

    if (!isLoggedIn) {
        return <LoginOverlay pageName="Comunidad (Social)" />;
    }

    const filtered = recipes.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="contenedor-principal">
            <div>
                <div className='bienvenida'>
                    <h1>Recetas de la comunidad</h1>
                </div>

                <div className="social-search-bar">
                    <Search size={18} className="social-search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar recetas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <section>
                    <div>
                        {filtered.length > 0 ? (
                            filtered.map((recipe) => (
                                <CardRecipes key={recipe.id} recipe={recipe} />
                            ))
                        ) : (
                            <div className="no-results" style={{ gridColumn: '1 / -1' }}>
                                <p>
                                    {search
                                        ? `No se encontraron recetas para "${search}"`
                                        : 'Aún no hay recetas de la comunidad. ¡Sé el primero en compartir!'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <button
                    className="fab-add-recipe"
                    onClick={() => navigate('/upload')}
                    title="Añadir receta"
                >
                    <Plus />
                </button>
            </div>
        </div>
    )
}

export default Social
