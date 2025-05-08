import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWishlist } from "./WishlistContext";
import "./Wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, loading, removeFromWishlist, fetchWishlist } = useWishlist();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      console.log("No user found, redirecting to login");
      navigate("/login");
      return;
    }

    // Fetch wishlist whenever component mounts or pathname changes
    console.log("Fetching wishlist...");
    fetchWishlist();
  }, [navigate, location.pathname, fetchWishlist]);

  const handleRemoveFromWishlist = async (product) => {
    try {
      await removeFromWishlist(product);
    } catch (error) {
      alert('Failed to remove item from wishlist');
    }
  };

  if (loading) {
    return <div>Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-container">
      <h2>My Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty</p>
      ) : (
        <div className="wishlist-items">
          {wishlist.map((item) => (
            <div key={item.product_id} className="wishlist-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>${item.unitPrice}</p>
                <div className="button-group">
                  <button onClick={() => navigate(`/product/${item.product_id}`)}>
                    View Product
                  </button>
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveFromWishlist(item)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;