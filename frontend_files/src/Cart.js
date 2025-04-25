// Cart.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, deleteFromCart, totalPrice } = useContext(CartContext);
  const items = Array.isArray(cartItems) ? cartItems : [];
  const navigate = useNavigate();

  const [showBankingModal, setShowBankingModal] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    name: '',
    cardNumber: '',
    expiryDate: '',
    ccv: '',
  });

  const handleCheckout = () => {
    setShowBankingModal(true); // Show the banking modal
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    setShowBankingModal(false); // Close the modal
    navigate('/invoice', { state: { invoice: { purchased: cartItems, total_price: totalPrice } } }); // Navigate to InvoicePage
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
                <img src={item.image || '/placeholder.jpg'} alt={item.name} width="60" />
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
          <button className="checkout-btn" onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      )}

      {/* Banking Modal */}
      {showBankingModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Banking Information</h2>
            <p>Please enter your card information:</p>
            <form onSubmit={handleModalSubmit}>
              <div>
                <label>Name on Card:</label>
                <input
                  type="text"
                  name="name"
                  value={cardInfo.name}
                  onChange={handleModalChange}
                  required
                />
              </div>
              <div>
                <label>Card Number:</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardInfo.cardNumber}
                  onChange={handleModalChange}
                  required
                />
              </div>
              <div>
                <label>Expiry Date:</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={cardInfo.expiryDate}
                  onChange={handleModalChange}
                  required
                />
              </div>
              <div>
                <label>CCV:</label>
                <input
                  type="text"
                  name="ccv"
                  value={cardInfo.ccv}
                  onChange={handleModalChange}
                  required
                />
              </div>
              <button type="submit">Proceed to Invoice</button>
              <button type="button" onClick={() => setShowBankingModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;