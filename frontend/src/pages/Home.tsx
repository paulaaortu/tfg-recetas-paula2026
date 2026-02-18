import Header from '../components/Header'
import RecipeList from '../components/RecipeList'
import Menu from '../components/Menu'
import './Home.css'

function Home() {
    return (
        <div className="home-wrapper">
            <div className="home-container">
                <Header
                    userName="Paula"
                    pantryCount={16}
                    onViewRecipes={() => console.log('Ver recetas')}
                />

                <RecipeList />

                <Menu onChange={(tab) => console.log('Tab:', tab)} />
            </div>
        </div>
    )
}
export default Home;