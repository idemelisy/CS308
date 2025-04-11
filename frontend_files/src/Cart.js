import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import './Cart.css'; // stil için bir şeyler varsa

const Cart = () => {
  const { cartItems, removeFromCart, totalPrice, clearCart } = useContext(CartContext);

  const handleCheckout = () => {
    alert("Siparişiniz alınmıştır! 🚀");
    clearCart();
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} width="60" />
                <div className="cart-info">
                  <p>{item.name}</p>
                  <p>{item.price} TL</p>
                  <p>Quantity: {item.quantity}</p>
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <h3>Total: {totalPrice.toFixed(2)} TL</h3>
          <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
