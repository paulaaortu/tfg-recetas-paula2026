import type { Recipe } from "../types/recipes";

interface Props {
    recipe: Recipe;
}

function CardRecipe({ recipe }: Props) {
    return (
        <div className="card">
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
        </div>
    );
}

export default CardRecipe;
