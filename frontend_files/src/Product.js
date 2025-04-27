import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StarRating from "./StarRating";
import { useCart } from "./CartContext";
import { getCurrentUser } from "./global";

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
    console.log("Current user from storage:", currentUser);
  
    try {
      const parsed = typeof currentUser === "string" ? JSON.parse(currentUser) : currentUser;
      console.log("************************", parsed); // <-- this should appear!
      console.log("Parsed user:", parsed);
  
      if (parsed && (parsed.account_id || parsed.email)) {
        const userState = {
          userId: parsed.account_id ?? parsed.email, // prefer account_id!
          username: parsed.name || "User",
          email: parsed.email || "noemail@domain.com",
        };
        console.log("Setting user state to:", userState);
        setUser(userState);
      } else {
        console.warn("Parsed user missing account_id and email, treating as Guest.");
        setUser({ userId: "Guest", username: "Anonymous" });
      }
      console.table(parsed);

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

  // Add new useEffect to track user state changes
  useEffect(() => {
    console.log("🔵 User state changed to:", user);
  }, [user]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleCommentSubmit = (e) => {
    
    e.preventDefault();

    if (!user || !user.userId || user.userId === "Guest") {
      console.log("User state at comment submit:", user); 
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
        console.log("Review submission result:", result);
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
  
    console.log("Current user during rating:", user);
    setUserRating(value); // just update the local state, don't POST here
  };
  

  if (loading || loadingUser || user === null) {
    console.log("Waiting for user and product...");
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
        <div className="product-details">
          <h2>{product.name}</h2>
          <p className="product-description">{product.description}</p>
          <p className="product-price">${product.unitPrice.toFixed(2)}</p>
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
              <p>
                <strong>{review.userId || "Anonymous"}</strong>
                {" ("}
                {new Date(review.date).toLocaleString()}
                {")"}
              </p>
              <p>{review.content}</p>
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
    </div>
  );
};

export default Product;
