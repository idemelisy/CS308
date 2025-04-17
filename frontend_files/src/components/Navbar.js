import React, { useState } from "react";
import { Link } from "react-router-dom";
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
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/order-history">Order History</Link></li>
        <li><Link to="/cart">Cart</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
