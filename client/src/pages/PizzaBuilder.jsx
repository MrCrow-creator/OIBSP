import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaCheck, FaArrowRight, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Veggies', 'Meats'];

export default function PizzaBuilder() {
    const [currentStep, setCurrentStep] = useState(0);
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selection, setSelection] = useState({
        base: null,
        sauce: null,
        cheese: null,
        veggies: [],
        meats: [],
    });
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await api.get('/inventory/all');
            setInventory(response.data.data);
        } catch (error) {
            toast.error('Failed to load ingredients');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (type, item) => {
        if (type === 'veggies' || type === 'meats') {
            setSelection((prev) => {
                const isSelected = prev[type].some((i) => i.id === item.id);
                if (isSelected) {
                    return { ...prev, [type]: prev[type].filter((i) => i.id !== item.id) };
                } else {
                    return { ...prev, [type]: [...prev[type], item] };
                }
            });
        } else {
            setSelection((prev) => ({ ...prev, [type]: item }));
        }
    };

    const isSelected = (type, item) => {
        if (type === 'veggies' || type === 'meats') {
            return selection[type].some((i) => i.id === item.id);
        }
        return selection[type]?.id === item.id;
    };

    const calculatePrice = () => {
        let total = 0;
        if (selection.base) total += parseFloat(selection.base.price) || 0;
        if (selection.sauce) total += parseFloat(selection.sauce.price) || 0;
        if (selection.cheese) total += parseFloat(selection.cheese.price) || 0;
        selection.veggies.forEach((v) => (total += parseFloat(v.price) || 0));
        selection.meats.forEach((m) => (total += parseFloat(m.price) || 0));
        return total;
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return selection.base !== null;
            case 1: return selection.sauce !== null;
            case 2: return selection.cheese !== null;
            case 3: return true; // Veggies are optional
            case 4: return true; // Meats are optional
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleAddToCart = () => {
        if (!selection.base || !selection.sauce || !selection.cheese) {
            toast.error('Please complete all required selections');
            return;
        }

        const pizza = {
            base: selection.base,
            sauce: selection.sauce,
            cheese: selection.cheese,
            veggies: selection.veggies,
            meats: selection.meats,
            baseId: selection.base.id,
            sauceId: selection.sauce.id,
            cheeseId: selection.cheese.id,
            veggieIds: selection.veggies.map((v) => v.id),
            meatIds: selection.meats.map((m) => m.id),
            itemPrice: calculatePrice(),
            quantity: 1,
        };

        addToCart(pizza);
        toast.success('Pizza added to cart! 🍕');
        navigate('/checkout');
    };

    const renderStepContent = () => {
        if (!inventory) return null;

        const stepConfig = {
            0: { type: 'base', items: inventory.bases, title: 'Choose Your Base' },
            1: { type: 'sauce', items: inventory.sauces, title: 'Select Your Sauce' },
            2: { type: 'cheese', items: inventory.cheeses, title: 'Pick Your Cheese' },
            3: { type: 'veggies', items: inventory.veggies, title: 'Add Veggies (Optional)', multi: true },
            4: { type: 'meats', items: inventory.meats, title: 'Add Meats (Optional)', multi: true },
        };

        const config = stepConfig[currentStep];

        return (
            <div className="fade-in">
                <h2 className="text-center" style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--spacing-2)' }}>
                    {config.title}
                </h2>
                <p className="text-center" style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-8)' }}>
                    {config.multi ? 'Select as many as you like' : 'Choose one option'}
                </p>

                <div className="grid grid-cols-5 gap-4" style={{ maxWidth: 900, margin: '0 auto' }}>
                    {config.items.map((item) => (
                        <div
                            key={item.id}
                            className={`ingredient-card ${isSelected(config.type, item) ? 'selected' : ''}`}
                            onClick={() => handleSelect(config.type, item)}
                        >
                            <div className="ingredient-card-icon">
                                {isSelected(config.type, item) ? <FaCheck /> : '🍕'}
                            </div>
                            <div className="ingredient-card-name">{item.name}</div>
                            <div className="ingredient-card-price">₹{parseFloat(item.price).toFixed(2)}</div>
                            {item.stock <= item.threshold && (
                                <span className="badge badge-warning" style={{ marginTop: 'var(--spacing-2)', fontSize: '0.65rem' }}>
                                    Low Stock
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            <div className="container" style={{ padding: 'var(--spacing-8) var(--spacing-4)' }}>
                {/* Progress Steps */}
                <div className="progress-steps">
                    {STEPS.map((step, index) => (
                        <div key={step} className="flex items-center">
                            <div className={`progress-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}>
                                <span className="progress-step-number">
                                    {index < currentStep ? <FaCheck size={14} /> : index + 1}
                                </span>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: index <= currentStep ? 'var(--color-gray-800)' : 'var(--color-gray-500)' }}>
                                    {step}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`progress-step-line ${index < currentStep ? 'completed' : ''}`}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div style={{ marginBottom: 'var(--spacing-10)' }}>
                    {renderStepContent()}
                </div>

                {/* Current Selection & Price */}
                <div className="card" style={{ maxWidth: 900, margin: '0 auto var(--spacing-6)', padding: 'var(--spacing-4) var(--spacing-6)', background: 'var(--color-gray-50)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span style={{ fontWeight: 600 }}>Your Pizza:</span>
                            {selection.base && <span className="badge badge-info">{selection.base.name}</span>}
                            {selection.sauce && <span className="badge badge-warning">{selection.sauce.name}</span>}
                            {selection.cheese && <span className="badge badge-success">{selection.cheese.name}</span>}
                            {selection.veggies.length > 0 && (
                                <span className="badge badge-info">+{selection.veggies.length} veggies</span>
                            )}
                            {selection.meats.length > 0 && (
                                <span className="badge badge-error">+{selection.meats.length} meats</span>
                            )}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
                            ₹{calculatePrice().toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between" style={{ maxWidth: 900, margin: '0 auto' }}>
                    <button
                        onClick={handleBack}
                        className="btn btn-ghost"
                        disabled={currentStep === 0}
                    >
                        <FaArrowLeft /> Back
                    </button>

                    <div className="flex gap-3">
                        {currentStep < STEPS.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="btn btn-primary"
                                disabled={!canProceed()}
                            >
                                Next <FaArrowRight />
                            </button>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className="btn btn-primary btn-lg"
                                disabled={!selection.base || !selection.sauce || !selection.cheese}
                            >
                                <FaShoppingCart /> Add to Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
