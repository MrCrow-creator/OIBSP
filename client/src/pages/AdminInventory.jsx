import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaEdit, FaSave, FaTimes, FaPlus, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminInventory() {
    const [inventory, setInventory] = useState(null);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bases');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', stock: 100, threshold: 20 });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await api.get('/admin/inventory');
            setInventory(response.data.data);
            setLowStockItems(response.data.lowStockItems || []);
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

    const getItems = () => {
        if (!inventory) return [];
        return inventory[activeTab] || [];
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditForm({
            name: item.name,
            description: item.description || '',
            price: item.price,
            stock: item.stock,
            threshold: item.threshold,
            isActive: item.isActive,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async (id) => {
        try {
            await api.put(`/admin/inventory/${activeTab}/${id}`, {
                ...editForm,
                price: parseFloat(editForm.price),
                stock: parseInt(editForm.stock),
                threshold: parseInt(editForm.threshold),
            });

            setInventory((prev) => ({
                ...prev,
                [activeTab]: prev[activeTab].map((item) =>
                    item.id === id ? { ...item, ...editForm, price: parseFloat(editForm.price), stock: parseInt(editForm.stock), threshold: parseInt(editForm.threshold) } : item
                ),
            }));

            setEditingId(null);
            toast.success('Item updated successfully!');
        } catch (error) {
            toast.error('Failed to update item');
        }
    };

    const addNewItem = async () => {
        try {
            const response = await api.post(`/admin/inventory/${activeTab}`, {
                name: newItem.name,
                description: newItem.description,
                price: parseFloat(newItem.price),
                stock: parseInt(newItem.stock),
                threshold: parseInt(newItem.threshold),
            });

            setInventory((prev) => ({
                ...prev,
                [activeTab]: [...prev[activeTab], response.data.data],
            }));

            setShowAddModal(false);
            setNewItem({ name: '', description: '', price: '', stock: 100, threshold: 20 });
            toast.success('Item added successfully!');
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const isLowStock = (item) => item.stock <= item.threshold;

    return (
        <div>
            <AdminSidebar />

            <main className="main-content">
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                        Inventory Management 📦
                    </h1>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                        <FaPlus /> Add New Item
                    </button>
                </div>

                {/* Low Stock Alert */}
                {lowStockItems.length > 0 && (
                    <div className="card" style={{ marginBottom: 'var(--spacing-6)', background: 'rgba(244, 67, 54, 0.05)', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                        <div className="card-body">
                            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--spacing-3)' }}>
                                <FaExclamationTriangle color="var(--color-error)" />
                                <h3 style={{ fontWeight: 600, color: 'var(--color-error)' }}>Low Stock Alert ({lowStockItems.length} items)</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {lowStockItems.map((item, index) => (
                                    <span key={index} className="badge badge-error">
                                        {item.name}: {item.stock} left (threshold: {item.threshold})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2" style={{ marginBottom: 'var(--spacing-6)' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
                        <div className="spinner-lg"></div>
                    </div>
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
                                    <tr key={item.id} style={{ background: isLowStock(item) ? 'rgba(244, 67, 54, 0.05)' : 'transparent' }}>
                                        {editingId === item.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        style={{ padding: 'var(--spacing-2)' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        style={{ padding: 'var(--spacing-2)' }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-input"
                                                        value={editForm.price}
                                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                        style={{ padding: 'var(--spacing-2)', width: 80 }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={editForm.stock}
                                                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                                                        style={{ padding: 'var(--spacing-2)', width: 80 }}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={editForm.threshold}
                                                        onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })}
                                                        style={{ padding: 'var(--spacing-2)', width: 80 }}
                                                    />
                                                </td>
                                                <td>
                                                    <select
                                                        className="form-input"
                                                        value={editForm.isActive}
                                                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                                                        style={{ padding: 'var(--spacing-2)' }}
                                                    >
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => saveEdit(item.id)} className="btn btn-primary btn-sm">
                                                            <FaSave />
                                                        </button>
                                                        <button onClick={cancelEdit} className="btn btn-ghost btn-sm">
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ fontWeight: 500 }}>{item.name}</td>
                                                <td style={{ color: 'var(--color-gray-600)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.description || '-'}
                                                </td>
                                                <td>₹{item.price.toFixed(2)}</td>
                                                <td>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: isLowStock(item) ? 'var(--color-error)' : 'inherit'
                                                    }}>
                                                        {item.stock}
                                                    </span>
                                                </td>
                                                <td>{item.threshold}</td>
                                                <td>
                                                    <span className={`badge ${item.isActive ? 'badge-success' : 'badge-error'}`}>
                                                        {item.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button onClick={() => startEdit(item)} className="btn btn-ghost btn-sm">
                                                        <FaEdit />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Item Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 style={{ fontWeight: 600 }}>Add New {activeTab.slice(0, -1)}</h3>
                                <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-icon">
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        placeholder="Enter description"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Price (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newItem.stock}
                                            onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Threshold</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={newItem.threshold}
                                            onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setShowAddModal(false)} className="btn btn-ghost">
                                    Cancel
                                </button>
                                <button
                                    onClick={addNewItem}
                                    className="btn btn-primary"
                                    disabled={!newItem.name || !newItem.price}
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
