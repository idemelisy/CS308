import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import "./Wishlist.css";
import { getCurrentUser } from './global.js';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { normalizeProduct } from "./utils/normalizeProduct";

function Wishlist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, loading, removeFromWishlist, fetchWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    //const user = localStorage.getItem('user');
    const user=getCurrentUser();
    if (!user) {
      console.log("No user found, redirecting to login");
      navigate("/login");
      return;
    }

    // Fetch wishlist whenever component mounts or pathname changes
    console.log("Fetching wishlist...");
    fetchWishlist();
  }, [navigate, location.pathname]);

  const handleRemoveFromWishlist = async (product) => {
    try {
      await removeFromWishlist(product);
    } catch (error) {
      alert('Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(normalizeProduct(product));
    toast.success("Item added to cart!", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className="loading-spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h2>My Wishlist</h2>
        <div className="wishlist-summary">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <FaHeart size={50} className="empty-wishlist-icon" />
          <p>Your wishlist is empty. Add items that you want to save for later!</p>
          <Link to="/home" className="empty-wishlist-button">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="wishlist-items">
            {wishlist.map((item) => (
              <div key={item.product_id} className="wishlist-item">
                <img 
                  src={item.image || '/placeholder.jpg'} 
                  alt={item.name}
                  onClick={() => navigate(`/product/${item.product_id}`)} 
                  style={{ cursor: 'pointer' }}
                />
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  <p className="item-price">${Number(item.unitPrice).toFixed(2)}</p>
                  <p className={`item-stock ${item.stock <= 0 ? 'out-of-stock' : ''}`}>
                    {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                  </p>
                  <div className="button-group">
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock <= 0}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveFromWishlist(item)}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="wishlist-footer">
            <Link to="/home" className="back-to-shop">
              Continue Shopping <FaArrowRight />
            </Link>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
}

export default Wishlist;