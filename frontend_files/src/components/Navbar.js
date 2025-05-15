import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../global";
import "./Navbar.css"; // We'll create this CSS file next
import { FaHeart } from "react-icons/fa"; // Import heart icon

const Navbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getCurrentUser());
  const [isGuest, setIsGuest] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const checkLogin = () => {
      const user = getCurrentUser();
      setIsLoggedIn(!!user);
      setIsGuest(user?.userType === "guest");
    };

    checkLogin(); // Check on initial load
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
    <div className="navbar-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1 className="logo" onClick={() => navigate('/')}>E-Commerce</h1>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            className="search-bar"
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          <button className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </button>
        </div>
        
        <ul className="nav-links">
          <li><a href="/" className="nav-link">Home</a></li>
          <li><a href="/order-history" className="nav-link">Order History</a></li>
          <li><a href="/Cart" className="nav-link">Cart</a></li>
          {!isGuest && (
            <li>
              <a href="/wishlist" className="nav-link nav-icon-link" title="Wishlist">
                <FaHeart size={18} color="#FF921C" />
              </a>
            </li>
          )}
          {isLoggedIn ? (
            <>
              {isGuest && (
                <li>
                  <a href="/convert-account" className="create-account-btn">
                    Create Account
                  </a>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><a href="/login" className="login-btn">Login</a></li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
