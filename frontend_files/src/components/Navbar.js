import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../global";

const Navbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getCurrentUser());
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!getCurrentUser());
    };

    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const handleLogout = async () => {
    const rawUser = getCurrentUser();
    const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

    if (user?.account_id) {
      try {
        await fetch(
          `http://localhost:8080/customers/clear-cart?customerID=${user.account_id}`,
          { method: "DELETE" }
        );
        console.log("🛒 Cart cleared on logout.");
      } catch (err) {
        console.error("❌ Failed to clear cart on logout:", err);
      }
    }

    logoutUser();
    window.location.href = "/login";
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    console.log("📝 Typing in search bar:", value);
    onSearch(value);
  };

  return (
    <nav className="navbar">
      <h1 className="logo">E-Commerce</h1>
      <input
        type="text"
        placeholder="Search products..."
        className="search-bar"
        value={searchInput}
        onChange={handleSearchInputChange}
      />
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="#">Shop</a></li>
        <li><a href="/order-history">Order History</a></li>
        <li><a href="/Cart">Cart</a></li>
        {isLoggedIn ? (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        ) : (
          <li><a href="/login">Login</a></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
