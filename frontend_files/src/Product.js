import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StarRating from "./StarRating";



const Product = () => {
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState(""); // State for new comment
  const [comments, setComments] = useState([]); // Store comments

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

    // Fetch reviews separately
    fetch(`http://localhost:8080/products/${id}/reviews`)
      .then((response) => response.json())
      .then((reviews) => {
        setComments(reviews);
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  }, [id]);

  if (loading) return <h2>Loading...</h2>;
  if (!product) return <h2>Product not found</h2>;

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const commentData = { user: "Guest", comment: newComment };

    fetch(`http://localhost:8080/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData),
    })
      .then(() => {
        setComments([...comments, commentData]); // Update UI
        setNewComment(""); // Clear input
      })
      .catch((error) => console.error("Error posting comment:", error));
  };

  return (
    <div className="product-page">
      <div className="product-info">
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="product-details">
          <h2>{product.name}</h2>
          <p className="product-description">{product.description}</p>
          <p className="product-price">${product.unit_price.toFixed(2)}</p>
          <p className="product-rating">⭐ {product.rating} / 5</p>
          <button className="add-to-cart">Add to Cart</button>
          <h3>Rate this Product:</h3>
          <StarRating />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        {comments.length > 0 ? (
          comments.map((review, index) => (
            <div key={index} className="review">
              <p><strong>{review.user}</strong> ⭐ {review.rating} / 5</p>
              <p>{review.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      {/* Comment Section */}
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
