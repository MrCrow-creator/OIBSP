import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaEdit, FaSave, FaTimes, FaPlus, FaExclamationTriangle } from 'react-icons/fa';

export default function Inventory() {
    const [inventory, setInventory] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('bases');
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', stock: 100, threshold: 20 });

    useEffect(() => { fetchInventory(); }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/admin/inventory');
            setInventory(res.data.data);
            setLowStock(res.data.lowStockItems || []);
        } catch (error) {
            toast.error('Failed to fetch inventory');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'bases', label: 'Pizza Bases' },
        { key: 'sauces', label: 'Sauces' },
        { key: 'cheeses', label: 'Cheeses' },
        { key: 'veggies', label: 'Veggies' },
        { key: 'meats', label: 'Meats' },
    ];

    const getItems = () => inventory?.[tab] || [];

    const startEdit = (item) => {
        setEditId(item.id);
        setEditForm({ name: item.name, description: item.description || '', price: item.price, stock: item.stock, threshold: item.threshold, is_active: item.is_active });
    };

    const saveEdit = async (id) => {
        try {
            await api.put(`/admin/inventory/${tab}/${id}`, {
                ...editForm,
                price: parseFloat(editForm.price),
                stock: parseInt(editForm.stock),
                threshold: parseInt(editForm.threshold),
                isActive: editForm.is_active,
            });
            setInventory((prev) => ({
                ...prev,
                [tab]: prev[tab].map((item) => item.id === id ? { ...item, ...editForm, price: parseFloat(editForm.price), stock: parseInt(editForm.stock), threshold: parseInt(editForm.threshold) } : item),
            }));
            setEditId(null);
            toast.success('Item updated!');
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const addItem = async () => {
        try {
            const res = await api.post(`/admin/inventory/${tab}`, {
                name: newItem.name,
                description: newItem.description,
                price: parseFloat(newItem.price),
                stock: parseInt(newItem.stock),
                threshold: parseInt(newItem.threshold),
            });
            setInventory((prev) => ({ ...prev, [tab]: [...prev[tab], res.data.data] }));
            setShowAdd(false);
            setNewItem({ name: '', description: '', price: '', stock: 100, threshold: 20 });
            toast.success('Item added!');
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const isLow = (item) => item.stock <= item.threshold;

    return (
        <div>
            <Sidebar />
            <main className="main-content">
                <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Inventory Management 📦</h1>
                    <button onClick={() => setShowAdd(true)} className="btn btn-primary"><FaPlus /> Add Item</button>
                </div>

                {lowStock.length > 0 && (
                    <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(244, 67, 54, 0.05)', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                        <div className="card-body">
                            <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                                <FaExclamationTriangle color="#f44336" />
                                <h3 style={{ fontWeight: 600, color: '#f44336' }}>Low Stock ({lowStock.length})</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {lowStock.map((item, i) => (
                                    <span key={i} className="badge badge-error">{item.name}: {item.stock}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-2" style={{ marginBottom: '1.5rem' }}>
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}><div className="spinner-lg"></div></div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Threshold</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getItems().map((item) => (
                                    <tr key={item.id} style={{ background: isLow(item) ? 'rgba(244, 67, 54, 0.05)' : 'transparent' }}>
                                        {editId === item.id ? (
                                            <>
                                                <td><input type="text" className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ padding: '0.5rem' }} /></td>
                                                <td><input type="text" className="form-input" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={{ padding: '0.5rem' }} /></td>
                                                <td><input type="number" className="form-input" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={{ padding: '0.5rem', width: 80 }} /></td>
                                                <td><input type="number" className="form-input" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} style={{ padding: '0.5rem', width: 70 }} /></td>
                                                <td><input type="number" className="form-input" value={editForm.threshold} onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })} style={{ padding: '0.5rem', width: 70 }} /></td>
                                                <td>
                                                    <select className="form-input" value={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })} style={{ padding: '0.5rem' }}>
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => saveEdit(item.id)} className="btn btn-primary btn-sm"><FaSave /></button>
                                                        <button onClick={() => setEditId(null)} className="btn btn-ghost btn-sm"><FaTimes /></button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ fontWeight: 500 }}>{item.name}</td>
                                                <td style={{ color: 'var(--color-gray-600)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description || '-'}</td>
                                                <td>₹{parseFloat(item.price).toFixed(2)}</td>
                                                <td style={{ fontWeight: 600, color: isLow(item) ? '#f44336' : 'inherit' }}>{item.stock}</td>
                                                <td>{item.threshold}</td>
                                                <td><span className={`badge ${item.is_active ? 'badge-success' : 'badge-error'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>
                                                <td><button onClick={() => startEdit(item)} className="btn btn-ghost btn-sm"><FaEdit /></button></td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showAdd && (
                    <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Add New {tab.slice(0, -1)}</h3>
                                <button onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm"><FaTimes /></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input type="text" className="form-input" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <input type="text" className="form-input" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Price (₹)</label>
                                        <input type="number" className="form-input" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input type="number" className="form-input" value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Threshold</label>
                                        <input type="number" className="form-input" value={newItem.threshold} onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
                                <button onClick={addItem} className="btn btn-primary" disabled={!newItem.name || !newItem.price}>Add</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
