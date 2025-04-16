import React, { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import OrderHistory from "./OrderHistory";
import { getCurrentUser, logoutUser } from "./global";


const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getCurrentUser());// Check if user is logged in
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
        await fetch(`http://localhost:8080/customers/clear-cart?customerID=${user.account_id}`, {
          method: "DELETE",
        });
        console.log("Cart cleared on logout.");
      } catch (err) {
        console.error("Failed to clear cart on logout:", err);
      }
    }
  
    logoutUser();
    window.location.href = "/login";
  };
  

  return (
    <nav className="navbar">
      <h1 className="logo">E-Commerce</h1>
      <input type="text" placeholder="Search products..." className="search-bar" />
      <ul className="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Shop</a></li>
        <li><a href="/order-history">Order History</a></li>
        <li><a href="/Cart">Cart</a></li>
        {isLoggedIn ? (
          <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
        ) : (
          <li><a href="/login">Login</a></li>
        )}
      </ul>
    </nav>
  );
};



const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="product-card"
      onClick={() => navigate(`/product/${product.product_id}`)}
    >
      <img src={product.image} alt={product.productName} className="product-image" />
      <h2 className="product-title">{product.name}</h2>
      <p className="product-price">${product.unit_price.toFixed(2)}</p>
      <p className="product-quantity">Stock: {product.stock}</p>
      <p className="product-description"> {product.description}</p>
    </div>
  );
};


const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/products/all") // Adjust URL based on your backend port
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="homepage">
      <Navbar />
      <div className="product-grid" style={{ display: "flex", gap: "20px", overflowX: "auto", whiteSpace: "nowrap", padding: "20px" }}>
        {loading ? <p>Loading products...</p> : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <footer className="footer">
        <p>© 2025 E-Commerce | <a href="#">Terms & Conditions</a></p>
      </footer>
    </div>
  );
};

export default Home;