// src/components/Header.tsx

interface HeaderProps {
    userName: string
    pantryCount: number
    onViewRecipes: () => void
}

export default function Header({ userName, pantryCount, onViewRecipes }: HeaderProps) {
    return (
        <div className="header">
            <div className="greeting">
                <h1>
                    Hola, <span className="name-underline">{userName}</span>
                </h1>
                <p className="subtitle">¿Qué cocinamos hoy?</p>
            </div>

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
        </div>
    )
}