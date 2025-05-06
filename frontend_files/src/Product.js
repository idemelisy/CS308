import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StarRating from "./StarRating";
import { useCart } from "./CartContext";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaHeart } from "react-icons/fa";
import { useWishlist } from "./WishlistContext";
const getCurrentUser = () => {
  return localStorage.getItem('user');
};

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [user, setUser] = useState(null);
  const getCurrentUser = () => {
    return localStorage.getItem('user');
  };
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  useEffect(() => {
    const currentUser = getCurrentUser();
    try {
      const parsed = typeof currentUser === "string" ? JSON.parse(currentUser) : currentUser;
      if (parsed && (parsed.account_id || parsed.email)) {
        const userState = {
          userId: parsed.account_id ?? parsed.email,
          username: parsed.name || "User",
          email: parsed.email || "noemail@domain.com",
        };
        setUser(userState);
      } else {
        setUser({ userId: "Guest", username: "Anonymous" });
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUser({ userId: "Guest", username: "Anonymous" });
    }
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8080/products/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setLoading(false);
      });

    fetch(`http://localhost:8080/products/reviews?product_id=${id}`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("Error fetching comments:", error));

    fetch(`http://localhost:8080/products/${id}/average_rating?product_id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        const rating = parseFloat(data);
        setAverageRating(isNaN(rating) ? 0 : rating);
      })
      .catch((error) => console.error("Error fetching average rating:", error));
  }, [id]);

  useEffect(() => {
    console.log("🔵 User state changed to:", user);
  }, [user]);

  const handleAddToCart = () => {
    if (!product || !product.stock || product.stock <= 0) {
      toast.error("Sorry, this product is out of stock!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }
     
    addToCart(product);
    toast.success("Product Added to Cart Successfully!", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!user || !user.userId || user.userId === "Guest") {
      alert("You need to be logged in to submit a review.");
      return;
    }

    if (newComment.trim() === "" || userRating === 0) {
      alert("Please provide both a comment and a rating.");
      return;
    }

    const reviewObject = {
      rating_id: null,
      comment_id: null,
      productId: id,
      userId: user.userId,
      userEmail: user.email,
      rating: userRating,
      content: newComment,
      date: null
    };

    fetch(`http://localhost:8080/products/add-comment-rating`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "userId": user.userId
      },
      body: JSON.stringify(reviewObject)
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        }
        return response.text();
      })
      .then((result) => {
        alert("Your review has been submitted and is waiting for approval.");
        setNewComment("");
        setUserRating(0);
      })
      .catch((error) => {
        console.error("Error posting comment and rating:", error);
        alert("There was an error submitting your review.");
      });
  };

  const handleRate = (value) => {
    if (!user || !user.userId || user.userId === "Guest") {
      alert("You need to be logged in to rate this product.");
      return;
    }
    setUserRating(value);
  };

  if (loading || loadingUser || user === null) {
    return <h2>Loading...</h2>;
  }

  if (!product) return <h2>Product not found</h2>;

  return (
    <div className="product-page">
      <div className="product-info">
        <img 
          src={`/images/${product.id}.jpg`} 
          alt={product.name} 
          className="product-image" 
        />

        <div className="product-details" style={{padding: "0 36px 0 0"}}>
          <h2>{product.name}</h2>
          <p className="product-description">{product.description}</p>
          <p className="product-price">
            ${Number.isFinite(product?.unitPrice) ? product.unitPrice.toFixed(2) : "0.00"}
          </p>

          <p className="product-rating">
            ⭐ {isNaN(averageRating) ? "No rating yet" : averageRating.toFixed(1)} / 5
          </p>
          
          <p className="product-stock">
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <button style={{maxWidth: "360px"}} className="add-to-cart" onClick={handleAddToCart}>Add to Cart</button>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginTop: '20px'
          }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-middle',
                    marginRight: '20px'
                  }}>
                    <h3>Rate this Product:</h3>
                    <StarRating onRate={handleRate} />
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-middle',
                    marginRight: '20px'
                  }}>
                  <h3>Add to Wishlist</h3>
                  <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          marginTop: "-12px",
                        }}
                        title="Add to Wishlist"
                        onClick={() => addToWishlist(product)}
                      >
                        <FaHeart size={45} color="#e63946" />
                      </button>
                  </div>
          </div>
        </div>
      </div>
      
      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        {comments.length > 0 ? (
          comments.map((review, index) => (
            <div key={index} className="review">
              <p><strong>{review.userId || "Anonymous"}</strong></p>
              <p><strong>Rating:</strong> {review.rating ? `${review.rating}/5` : "No rating"}</p>
              <p>{review.content}</p>
              <p><em>{new Date(review.date).toLocaleString()}</em></p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      <div className="comments-section">
        <h3>Leave a Comment</h3>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            rows="4"
            cols="50"
          />
          <button type="submit">Submit Comment</button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Product;
