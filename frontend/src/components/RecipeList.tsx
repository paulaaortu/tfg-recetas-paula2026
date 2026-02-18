import { useEffect, useState } from "react";
import CardRecipe from "./CardRecipes";
import { getRecipes } from "../services/recipeService";
import type { Recipe } from "../types/recipes";

function RecipeList() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        getRecipes().then(setRecipes);
    }, []);

    return (
        <div>
            {recipes.map((recipe) => (
                <CardRecipe key={recipe.id} recipe={recipe} />
            ))}
        </div>
    );
}

export default RecipeList;
