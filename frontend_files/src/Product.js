import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import { useCart } from "./CartContext";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaHeart, FaShoppingCart, FaStar, FaRegStar, FaArrowLeft, FaBoxOpen } from "react-icons/fa";
import { useWishlist } from "./WishlistContext";
import { getCurrentUser } from './global'; // Import from global.js
import "./ProductPage.css"; // Will create this file next
import { normalizeProduct } from "./utils/normalizeProduct";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const errorHandledRef = useRef(false);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    const currentUser = getCurrentUser()
    try {
      if (currentUser && (currentUser.userId ?? currentUser.account_id)) {
        const userState = {
          userId: currentUser.account_id ?? currentUser.userId,
          username: currentUser.name || "User",
          email: currentUser.email || "noemail@domain.com",
        };
        setUser(userState);
        setIsGuest(currentUser.userType === "guest");
      } else {
        setUser({ userId: "Guest", username: "Anonymous" });
        setIsGuest(true);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUser({ userId: "Guest", username: "Anonymous" });
      setIsGuest(true);
    }
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    setImageLoaded(false);
    setImageError(false);
    errorHandledRef.current = false;
    
    fetch(`http://localhost:8080/products/${id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Product:", data);
        setProduct(data);
        setLoading(false);
        
        // Preload the image
        if (data && data.image) {
          preloadImage(data.image)
            .catch(() => {
              setImageError(true);
              errorHandledRef.current = true;
            });
        }
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
      
    // Cleanup function
    return () => {
      setImageLoaded(false);
      setImageError(false);
    };
  }, [id]);

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
    
    // Add to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(normalizeProduct(product));
    }
    
    toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const handleAddToWishlist = async () => {
    if (!user || !user.userId || user.userId === "Guest") {
      toast.error("Please log in to add items to your wishlist", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    try {
      await addToWishlist(product);
      toast.success("Product Added to Wishlist!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } catch (error) {
      toast.error(error.message || "Failed to add to wishlist", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!user || !user.userId || user.userId === "Guest") {
      toast.error("You need to be logged in to submit a review.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    if (newComment.trim() === "" || userRating === 0) {
      toast.warning("Please provide both a comment and a rating.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }
    
    const reviewObject = {
      rating_id: null,
      comment_id: null,
      productId: id,
      userId: user.userId || user.account_id,
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
        toast.success("Your review has been submitted and is waiting for approval.", {
          position: "bottom-right",
          autoClose: 3000,
        });
        setNewComment("");
        setUserRating(0);
      })
      .catch((error) => {
        console.error("Error posting comment and rating:", error);
        toast.error("There was an error submitting your review.", {
          position: "bottom-right",
          autoClose: 3000,
        });
      });
  };

  const handleRate = (value) => {
    if (!user || !user.userId || user.userId === "Guest") {
      toast.info("You need to be logged in to rate this product.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }
    setUserRating(value);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  // Function to get proper image URL
  const getImageUrl = () => {
    if (!product || !product.image) {
      return '/images/no-image-available.jpg';
    }
    
    return product.image;
  };

  // Generate star display for average rating
  const renderStars = (rating) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star}>
            {star <= Math.round(rating) ? 
              <FaStar className="star-filled" /> : 
              <FaRegStar className="star-empty" />
            }
          </span>
        ))}
        <span className="rating-number">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Function to preload image
  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
  };

  // Function to handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Function to handle image error
  const handleImageError = (e) => {
    if (!errorHandledRef.current) {
      errorHandledRef.current = true;
      setImageError(true);
      e.target.src = '/images/no-image-available.jpg';
    }
  };

  if (loading || loadingUser || user === null) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading product details...</h2>
      </div>
    );
  }

  if (!product) return (
    <div className="error-container">
      <h2>Product not found</h2>
      <p>The product you're looking for doesn't seem to exist.</p>
      <button className="back-button" onClick={() => navigate('/home')}>
        <FaArrowLeft /> Back to Home
      </button>
    </div>
  );

  return (
    <div className="product-page-container">
      <div className="product-page">
        {/* Back button */}
        <button 
          className="back-button" 
          onClick={() => navigate('/home')}
        >
          <FaArrowLeft /> Back to Products
        </button>
        
        <div className="product-info">
          <div className="product-image-container">
            {!imageLoaded && !imageError && (
              <div className="image-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <img 
              src={getImageUrl()} 
              alt={product.name} 
              className={`product-image ${imageLoaded ? 'loaded' : 'loading'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-meta">
              <div className="product-rating-display">
                {renderStars(averageRating || 0)}
                <span className="review-count">
                  {comments.length} {comments.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
              
              <div className="product-id">
                <span>Product ID: {product.product_id}</span>
              </div>
            </div>
            
            <div className="product-price-container">
              <span className="product-price">
                ${Number.isFinite(product?.unitPrice) ? product.unitPrice.toFixed(2) : "0.00"}
              </span>
            </div>
            
            <p className="product-description">{product.description}</p>
            
            <div className="product-stock-container">
              <div className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                <FaBoxOpen />
                {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </div>
            </div>
            
            {product.stock > 0 && (
              <div className="quantity-selector">
                <span>Quantity:</span>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn" 
                    onClick={decreaseQuantity} 
                    disabled={quantity <= 1}
                  >-</button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    className="quantity-btn" 
                    onClick={increaseQuantity} 
                    disabled={quantity >= product.stock}
                  >+</button>
                </div>
              </div>
            )}

            <div className="product-actions">
              <button 
                className={`add-to-cart-btn ${(!product.stock || product.stock <= 0) ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0}
              >
                <FaShoppingCart /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {!isGuest && (
                <button
                  className="add-to-wishlist-btn"
                  onClick={handleAddToWishlist}
                  title="Add to Wishlist"
                >
                  <FaHeart />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="product-tabs">
          <div className="reviews-section">
            <h2 className="section-title">Customer Reviews</h2>
            
            {comments.length > 0 ? (
              <div className="reviews-list">
                {comments.map((review, index) => (
                  <div key={index} className="review-card">
                    <div className="review-header">
                      <span className="reviewer-name">{review.userId || "Anonymous"}</span>
                      <div className="review-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? 
                              <FaStar className="star-filled" /> : 
                              <FaRegStar className="star-empty" />
                            }
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="review-date">
                      {new Date(review.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <p className="review-content">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}

            <div className="write-review-section">
              <h3>Write a Review</h3>
              <form onSubmit={handleCommentSubmit} className="review-form">
                <div className="form-group">
                  <label>Your Rating</label>
                  <StarRating onRate={handleRate} />
                </div>
                <div className="form-group">
                  <label>Your Review</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows="4"
                  />
                </div>
                <button type="submit" className="submit-review-btn">Submit Review</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default Product;
