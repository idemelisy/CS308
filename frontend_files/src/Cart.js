// Cart.js
import React, { useContext } from 'react';
import { CartContext } from './CartContext'; // Fix import here
import './Cart.css';

const Cart = () => {
  const { cartItems, deleteFromCart, totalPrice, checkout } = useContext(CartContext); // Using context properly
  const items = Array.isArray(cartItems) ? cartItems : [];

  const handleCheckout = () => {
    alert("Your order has been placed! 🚀");
    checkout();
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image || "/placeholder.jpg"} alt={item.name} width="60" />
                <div className="cart-info">
                  <p>{item.name}</p>
                  <p>{item.price} TL</p>
                  <p>Quantity: {item.quantity}</p>
                  <button onClick={() => deleteFromCart(item)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <h3>Total: {Number(totalPrice || 0).toFixed(2)} TL</h3>
          <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
        </div>
      )}
    </div>
  );
};

export default Cart;