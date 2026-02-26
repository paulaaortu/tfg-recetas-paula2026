// src/components/PantryCard.tsx
import './PantryCard.css'

interface PantryCardProps {
    pantryCount: number
    onViewRecipes: () => void
}

export default function PantryCard({ pantryCount, onViewRecipes }: PantryCardProps) {
    return (
        <div className="pantry-card">
            <div className="pantry-card-top">
                <p className="pantry-title">Recetas con lo que tienes</p>
                <span className="pantry-icon">📦</span>
            </div>
            <p className="pantry-count">Tienes {pantryCount} ingredientes en tu despensa</p>
            <button className="pantry-btn" onClick={onViewRecipes}>
                Ver que puedo cocinar
            </button>
        </div>
    )
}
