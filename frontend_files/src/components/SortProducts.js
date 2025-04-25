import React, { useState } from "react";
import "./SortProducts.css";

const SortProducts = ({ onSorted }) => {
  const [sortType, setSortType] = useState("");

  const fetchSortedProducts = async (type) => {
    if (!type) return;
    try {
      const response = await fetch(`http://localhost:8080/products/${type}`);
      const data = await response.json();
      onSorted(data);
    } catch (err) {
      console.error("Sort fetch error:", err);
    }
  };

  const handleSortChange = (e) => {
    const selected = e.target.value;
    setSortType(selected);
    fetchSortedProducts(selected);
  };

  return (
    <div className="sort-container">
      <label style={{ marginRight: "8px" }}>Sort by:</label>
      <select value={sortType} onChange={handleSortChange}>
        <option value="">-- Select --</option>
        <option value="ascending">Price: Low to High</option>
        <option value="descending">Price: High to Low</option>
        <option value="popular">Most Popular</option>
      </select>
    </div>
  );
};

export default SortProducts;
