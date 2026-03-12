import React, { useState, useEffect } from 'react';
import { getPantryItems, addPantryItem, deletePantryItem } from '../services/pantryService';
import './Pantry.css';

interface PantryItem {
    id: number;
    ingredient_name: string;
    quantity: number | null;
    unit: string | null;
}

const Pantry: React.FC = () => {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    // Form state
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: '',
        unit: ''
    });

    const loadPantry = async () => {
        try {
            setLoading(true);
            const data = await getPantryItems();
            setItems(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const quantity = newItem.quantity ? parseFloat(newItem.quantity) : null;
            await addPantryItem(newItem.name, quantity, newItem.unit || null);
            setIsModalOpen(false);
            setNewItem({ name: '', quantity: '', unit: '' });
            loadPantry();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!window.confirm('¿Seguro que quieres eliminar este ingrediente?')) return;
        try {
            await deletePantryItem(id);
            loadPantry();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="contenedor-despensa">
            <div className="pantry-header">
                <h2>Mis Ingredientes</h2>
                <button className="add-btn" onClick={() => setIsModalOpen(true)}>+</button>
            </div>

            {loading ? (
                <p>Cargando tu despensa...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : items.length === 0 ? (
                <div>
                    <p>Tu despensa está vacía.</p>
                    <p>¡Empieza a añadir alimentos!</p>
                </div>
            ) : (
                <div className="pantry-list">
                    {items.map(item => (
                        <div key={item.id}>
                            <div>
                                <h3>{item.ingredient_name}</h3>
                                {item.quantity && (
                                    <p>{item.quantity} {item.unit}</p>
                                )}
                            </div>
                            <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}>
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Añadir Alimento</h2>
                        <form onSubmit={handleAddItem}>
                            <div className="form-group">
                                <label>Nombre del ingrediente</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                    placeholder="Ej: Harina"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cantidad (opcional)</label>
                                <input
                                    type="number"
                                    value={newItem.quantity}
                                    onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                    placeholder="Ej: 500"
                                    step="any"
                                />
                            </div>
                            <div className="form-group">
                                <label>Unidad (opcional)</label>
                                <input
                                    type="text"
                                    value={newItem.unit}
                                    onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                    placeholder="Ej: g, kg, uds"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="save-btn">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pantry;
