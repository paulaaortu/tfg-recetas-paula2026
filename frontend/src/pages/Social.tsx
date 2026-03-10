import { useEffect, useState } from 'react'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import { useNavigate } from 'react-router-dom'
import './Home.css' // Reuse Home styles for consistency

function Social() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const recipeService = new RecipeService()
    const navigate = useNavigate()

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            navigate('/login')
            return
        }

        const fetchRecipes = async () => {
            try {
                // Fetch ONLY user recipes (official=false)
                const data = await recipeService.getAllRecipes(false)
                setRecipes(data)
            } catch (error) {
                console.error('Error al cargar recetas sociales:', error)
            }
        }
        fetchRecipes()
    }, [navigate])

    return (
        <div className="contenedor-principal">
            <div>
                <div className='bienvenida'>
                    <h1>Recetas de la comunidad</h1>
                </div>

                <section>
                    <div>
                        {recipes.length > 0 ? (
                            recipes.map((recipe) => (
                                <CardRecipes key={recipe.id} recipe={recipe} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                Aún no hay recetas de la comunidad. ¡Sé el primero en compartir!
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Social
