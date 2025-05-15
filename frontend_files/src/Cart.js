// Cart.js
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import { getCurrentUser } from './global';
import './Cart.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaCreditCard, FaTimes } from 'react-icons/fa';

const Cart = () => {
  const { cartItems, deleteFromCart, totalPrice } = useContext(CartContext);
  const items = Array.isArray(cartItems) ? cartItems : [];
  const navigate = useNavigate();
  const [isGuest, setIsGuest] = useState(false);

  const [showBankingModal, setShowBankingModal] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    name: '',
    cardNumber: '',
    expiryDate: '',
    ccv: '',
  });

  useEffect(() => {
    const user = getCurrentUser();
    setIsGuest(user?.userType === "guest");
  }, []);

  const handleCheckout = () => {
    setShowBankingModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    setShowBankingModal(false);

    toast.success("Invoice has been sent! ✉️", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });

    navigate('/invoice', { state: { invoice: { purchased: cartItems, total_price: totalPrice } } });
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Shopping Cart</h2>
        <div className="cart-summary">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      {isGuest && (
        <div className="guest-banner">
          <p>You're shopping as a guest. <a href="/convert-account">Create an account</a> to save your cart and access order history!</p>
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="empty-cart">
          <FaShoppingCart size={50} color="#ddd" />
          <p>Your cart is empty.</p>
          <Link to="/home" className="empty-cart-button">Continue Shopping</Link>
        </div>
      ) : (
        <div>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.product_id} className="cart-item">
                <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                <div className="cart-info">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">${Number(item.unit_price || item.unitPrice || 0).toFixed(2)}</p>
                  <div className="cart-item-quantity">
                    <span>Quantity:</span>
                    <div className="quantity-controls">
                      <button className="quantity-btn" onClick={() => item.quantity > 1 && deleteFromCart(item)}>
                        <FaMinus size={12} />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button className="quantity-btn" style={{ backgroundColor: "#f7f7f7" }}>
                        <FaPlus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => deleteFromCart(item)}>
                  <FaTrash size={14} /> Remove
                </button>
              </li>
            ))}
          </ul>
          
          <div className="cart-footer">
            <div className="cart-total">
              Total: <span>${Number(totalPrice || 0).toFixed(2)}</span>
            </div>
            <button 
              className={`checkout-btn${isGuest ? ' disabled' : ''}`}
              onClick={isGuest ? undefined : handleCheckout}
              disabled={isGuest}
              title={isGuest ? 'Guests cannot checkout. Please create an account.' : ''}
            >
              <FaCreditCard /> Proceed to Checkout
            </button>
          </div>
          <Link to="/home" className="continue-shopping">Continue Shopping</Link>
        </div>
      )}

      {/* Banking Modal */}
      {showBankingModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Payment Information</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label>Name on Card</label>
                <input
                  type="text"
                  name="name"
                  value={cardInfo.name}
                  onChange={handleModalChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardInfo.cardNumber}
                  onChange={handleModalChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={cardInfo.expiryDate}
                  onChange={handleModalChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Security Code (CVC)</label>
                <input
                  type="text"
                  name="ccv"
                  value={cardInfo.ccv}
                  placeholder="123"
                  onChange={handleModalChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel"
                  onClick={() => setShowBankingModal(false)}
                >
                  <FaTimes /> Cancel
                </button>
                <button type="submit" className="confirm">
                  <FaCreditCard /> Complete Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Cart;
