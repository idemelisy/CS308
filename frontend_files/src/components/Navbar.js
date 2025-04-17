import React, { useState } from "react";
import "./Navbar.css";

const Navbar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch(searchText);
      setSearchText("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="logo">E-Commerce</h1>
        <input
          type="text"
          placeholder="Search products..."
          className="search-bar"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <ul className="nav-links">
        <li><a href="/home">Home</a></li>
        <li><a href="/order-history">Order History</a></li>
        <li><a href="/cart">Cart</a></li>
        <li><a href="/login">Login</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
