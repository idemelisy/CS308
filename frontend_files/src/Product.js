import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StarRating from "./StarRating";
import { useCart } from "./CartContext";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

  const { addToCart } = useCart();

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
        console.log("Fetched Product:", data);
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
        const result = await response.text();
  
        if (result.includes("Can't add comment for unbought product.")) {
          alert("You can't review unbought product.");
          return;
        }
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
          src={`/images/${product.product_id}.jpg`}
          alt={product.name}
          width="300"
          height="300"
          style={{ objectFit: "cover", borderRadius: "10px" }}
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
        />

        <div className="product-details">
          <h2>{product.name}</h2>
          <p className="product-description">{product.description}</p>
          <p className="product-price">
            {Number.isFinite(product?.unitPrice) ? product.unitPrice.toFixed(2) : "0.00"}TL
          </p>

          <p className="product-rating">
            ⭐ {isNaN(averageRating) ? "No rating yet" : averageRating.toFixed(1)} / 5
          </p>

          <button className="add-to-cart" onClick={handleAddToCart}>Add to Cart</button>

          <h3>Rate this Product:</h3>
          <StarRating onRate={handleRate} />
        </div>
      </div>

      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        {comments.length > 0 ? (
          comments.map((review, index) => (
            <div key={index} className="review">
              <p><strong>{review.userEmail || review.userId || "Anonymous"}</strong></p>
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
