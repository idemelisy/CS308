import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StarRating from "./StarRating";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0); // User's rating for the product

  // Fetch product, comments, and rating
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

    fetch(`http://localhost:8080/comments/product/${id}`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("Error fetching comments:", error));

    // Fetch the average rating
    fetch(`http://localhost:8080/products/${id}/average-rating`)
      .then((response) => response.json())
      .then((data) => {
        const rating = parseFloat(data);
        if (isNaN(rating)) {
          setAverageRating(0); // Set to a default value if not a valid number
        } else {
          setAverageRating(rating); // Set the actual rating if valid
        }
      })
      .catch((error) => console.error("Error fetching average rating:", error));
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const commentData = {
      productId: id,
      userId: "ide",
      content: newComment,
      date: new Date().toISOString(),
    };

    fetch(`http://localhost:8080/comments/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData),
    })
      .then((response) => response.json())
      .then((savedComment) => {
        setComments([...comments, savedComment]);
        setNewComment("");
      })
      .catch((error) => console.error("Error posting comment:", error));
  };

  const handleRate = async (value) => {
    setUserRating(value); // Update UI instantly

    const ratingData = {
      productId: id,
      userId: "Guest", // Ideally should be the actual user
      rating: value
    };

    try {
      const response = await fetch(`http://localhost:8080/ratings/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Rating submitted successfully:", result);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  if (loading) return <h2>Loading...</h2>;
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
          <p className="product-price">${product.unit_price.toFixed(2)}</p>
          <p className="product-rating">
            ⭐ {isNaN(averageRating) ? "No rating yet" : averageRating.toFixed(1)} / 5
          </p>
          <button className="add-to-cart">Add to Cart</button>
          <h3>Rate this Product:</h3>
          <StarRating onRate={handleRate} /> {/* Pass the handleRate function */}
        </div>
      </div>

      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        {comments.length > 0 ? (
          comments.map((review, index) => (
            <div key={index} className="review">
              <p>
                <strong>{review.userId}</strong> ({new Date(review.date).toLocaleString()})
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
