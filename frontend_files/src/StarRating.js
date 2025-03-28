import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const StarRating = ({ onRate }) => {
  const [rating, setRating] = useState(0); // User's rating
  const [hover, setHover] = useState(0); // Hover effect

  const handleClick = (ratingValue) => {
    setRating(ratingValue);
    if (onRate) {
      onRate(ratingValue); // Pass rating to parent if function exists
    }
  };

  return (
    <div style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={30}
          color={star <= (hover || rating) ? "#FFD700" : "#ccc"}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        />
      ))}
    </div>
  );
};

export default StarRating;
