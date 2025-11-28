'use client'
import { useCart } from "@/lib/contexts/DatabaseCartContext";
import { useState } from 'react';

const Counter = ({ productId, cartItemId, onQuantityChange }) => {
    const { cartItems, addToCart, updateQuantity } = useCart();
    const [quantity, setQuantity] = useState(() => {
        if (cartItemId) {
            // For cart page - get quantity from cartItems
            const item = cartItems.find(item => item.cartItemId === cartItemId);
            return item ? item.quantity : 1;
        } else {
            // For product pages - check if item exists in cart
            const item = cartItems.find(item => item.id === productId);
            return item ? item.quantity : 0;
        }
    });

    const addToCartHandler = () => {
        if (cartItemId) {
            // Update existing cart item
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);
            updateQuantity(cartItemId, newQuantity);
        } else {
            // Add new item to cart
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);
            addToCart({ id: productId }, 1);
        }
    }

    const removeFromCartHandler = () => {
        if (quantity > 0) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            
            if (cartItemId) {
                // Update existing cart item
                if (newQuantity === 0) {
                    // Remove item completely
                    onQuantityChange && onQuantityChange(cartItemId, 0);
                } else {
                    updateQuantity(cartItemId, newQuantity);
                }
            } else {
                // For product pages, we don't remove completely, just decrease
                addToCart({ id: productId }, -1);
            }
        }
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{quantity}</p>
            <button onClick={addToCartHandler} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter