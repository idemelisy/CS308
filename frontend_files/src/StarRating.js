import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import "./ProductPage.css";

const StarRating = ({ onRate, initialRating = 0 }) => {
  const [rating, setRating] = useState(initialRating); // User's rating
  const [hover, setHover] = useState(0); // Hover effect

  const handleClick = (ratingValue) => {
    setRating(ratingValue);
    if (onRate) {
      onRate(ratingValue); // Pass rating to parent if function exists
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={24}
          className={star <= (hover || rating) ? "star-filled" : "star-empty"}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{ cursor: 'pointer', marginRight: '5px', transition: 'all 0.2s ease' }}
        />
      ))}
      {rating > 0 && <span className="rating-text">Your rating: {rating}/5</span>}
    </div>
  );
};

export default StarRating;
