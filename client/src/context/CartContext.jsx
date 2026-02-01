import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    const addToCart = (pizza) => {
        setCart((prev) => [...prev, { ...pizza, cartId: Date.now() }]);
    };

    const removeFromCart = (cartId) => {
        setCart((prev) => prev.filter((item) => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, quantity) => {
        setCart((prev) =>
            prev.map((item) =>
                item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotal = () => {
        return cart.reduce((total, item) => total + item.itemPrice * (item.quantity || 1), 0);
    };

    const getItemCount = () => {
        return cart.reduce((count, item) => count + (item.quantity || 1), 0);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
