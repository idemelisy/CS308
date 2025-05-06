import React from "react";
import { useWishlist } from "./WishlistContext";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist, loading, removeFromWishlist } = useWishlist();

  return (
    <div className="wishlist-container">
      <h2>Your Wishlist</h2>
      {loading ? (
        <p>Loading wishlist...</p>
      ) : wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-list">
          {wishlist.map((product) => (
            <div key={product.id || product.product_id} className="wishlist-item">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name || product.productName}
                />
              )}
              <div className="wishlist-info">
                <p>{product.name || product.productName}</p>
              {/*  {product.unitPrice && <p>Price: ${product.unitPrice}</p>}
                console.log("Product:", product);
                {product.stock && <p>Stock: {product.stock}</p>}
                {product.description && <p>{product.description}</p>}  */}
              </div>
              <button
                className="remove-btn"
                onClick={() => removeFromWishlist(product)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;