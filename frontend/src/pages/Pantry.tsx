import React, { useState, useEffect, useRef } from 'react';
import { getPantryItems, addPantryItem, deletePantryItem } from '../services/pantryService';
import './Pantry.css';
import { Trash, Plus } from 'lucide-react';
import LoginOverlay from '../components/LoginOverlay';

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
    const [itemToDelete, setItemToDelete] = useState<PantryItem | null>(null);

    // Check session
    const user = localStorage.getItem('user');
    const isLoggedIn = !!user;
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: '',
        unit: ''
    });

    useEffect(() => {
        if (isLoggedIn) {
            loadPantry();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isModalOpen || itemToDelete) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen, itemToDelete]);

    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 0);
        }
    }, [isModalOpen]);

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

    if (!isLoggedIn) {
        return <LoginOverlay pageName="Despensa" />;
    }

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

    const handleDeleteItem = (item: PantryItem) => {
        setItemToDelete(item);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deletePantryItem(itemToDelete.id);
            loadPantry();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setItemToDelete(null);
        }
    };

    return (
        <div className="contenedor-despensa">
            <div className="pantry-header">
                <h2>Mis Ingredientes</h2>
                <button onClick={() => setIsModalOpen(true)}><Plus /></button>
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
                        <div key={item.id} className="pantry-item">
                            <div>
                                <h3>{item.ingredient_name}</h3>
                                {item.quantity && (
                                    <p>{item.quantity} {item.unit}</p>
                                )}
                            </div>
                            <button className="delete-btn" onClick={() => handleDeleteItem(item)}>
                                <Trash />
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
                                    ref={nameInputRef}
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

            {itemToDelete && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Eliminar ingrediente</h2>
                        <p>¿Seguro que quieres eliminar <strong>{itemToDelete.ingredient_name}</strong> de tu despensa?</p>
                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={() => setItemToDelete(null)}>
                                Cancelar
                            </button>
                            <button type="button" className="delete-confirm-btn" onClick={confirmDelete}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pantry;
