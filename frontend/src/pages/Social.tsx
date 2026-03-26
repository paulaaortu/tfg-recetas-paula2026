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

    const user = localStorage.getItem('user')
    const userData = user ? JSON.parse(user) : null
    const isLoggedIn = !!user
    const isAdmin = userData?.is_admin || false

    useEffect(() => {
        if (isLoggedIn) {
            const fetchRecipes = async () => {
                try {
                    const data = await recipeService.getAllRecipes(false, search)
                    setRecipes(data)
                } catch (error) {
                    console.error('Error al cargar recetas sociales:', error)
                }
            }
            fetchRecipes()
        }
    }, [isLoggedIn, search])

    if (!isLoggedIn) {
        return <LoginOverlay pageName="Comunidad (Social)" />;
    }

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
                    <div className="grid-recetas">
                        {recipes.length > 0 ? (
                            recipes.map((recipe) => (
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

                {!isAdmin && (
                    <button
                        className="fab-add-recipe"
                        onClick={() => navigate('/upload')}
                        title="Añadir receta"
                    >
                        <Plus />
                    </button>
                )}
            </div>
        </div>
    )
}

export default Social
