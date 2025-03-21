import React, { useState } from "react";
import { useParams } from "react-router-dom";
import StarRating from "./StarRating";

const productData = {
  1: { 
    id: 1, 
    name: "Laptop", 
    price: 999.99, 
    description: "A powerful laptop with high-speed performance.", 
    image: "https://via.placeholder.com/300",
    rating: 4.5,
    reviews: [
      { user: "Alice", rating: 5, comment: "Amazing performance!" },
      { user: "Bob", rating: 4, comment: "Good value for money." }
    ],
    comments: []  // Initialize comments as an empty array
  },
  2: { 
    id: 2, 
    name: "Smartphone", 
    price: 699.99, 
    description: "A sleek smartphone with the latest features.", 
    image: "https://via.placeholder.com/300",
    rating: 4.2,
    reviews: [
      { user: "Charlie", rating: 5, comment: "Super fast and reliable!" },
      { user: "Dave", rating: 3, comment: "Battery life could be better." }
    ],
    comments: []  // Initialize comments as an empty array
  }
};

const Product = () => {
  const { id } = useParams(); // Get product ID from URL
  const product = productData[id];
  const [rating, setRating] = useState(null);
  const [newComment, setNewComment] = useState(""); // State for new comment
  const [comments, setComments] = useState(product ? product.comments : []); // State for storing comments

  if (!product) {
    return <h2>Product not found</h2>;
  }

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return; // Don't submit empty comments
    const updatedComments = [...comments, { user: "Guest", comment: newComment }];
    setComments(updatedComments);
    setNewComment(""); // Clear the comment input
  };

  return (
    <div className="product-page">
      <div className="product-info">
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="product-details">
          <h2>{product.name}</h2>
          <p className="product-description">{product.description}</p>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-rating">⭐ {product.rating} / 5</p>
          <button className="add-to-cart">Add to Cart</button>
          <h3>Rate this Product:</h3>
          <StarRating onRate={(value) => setRating(value)} />
          {rating && <p>You rated this product {rating} stars!</p>}
        </div>
      </div>

      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        {product.reviews.length > 0 ? (
          product.reviews.map((review, index) => (
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

        <h3>Comments:</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment">
              <p><strong>{comment.user}</strong> says:</p>
              <p>{comment.comment}</p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default Product;
