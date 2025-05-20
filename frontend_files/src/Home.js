import React, { useEffect, useState } from "react";
import "./App.css";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logoutUser } from "./global";
import Navbar from "./components/Navbar";
import SortProducts from "./components/SortProducts"; // 🌟 BURAYI UNUTMA

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  console.log("💡 Rendering product card:", product);

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.product_id}`)}
    >
      
      <img
        src={product.image}
        alt={product.productName}
        className="product-image"
      />
      <h2 className="product-title">{product.name}</h2>
      <p className="product-price">
        {typeof product.unitPrice === "number" ? product.unitPrice.toFixed(2) : "0.00"}TL
      </p>
      <p className="product-quantity">Stock: {product.stock}</p>
      <p className="product-description">{product.description}</p>
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();
  console.log("📡 home is rendered");

  useEffect(() => {
    // Check if user is guest
    const user = getCurrentUser();
    setIsGuest(user?.userType === "guest");
  }, []);

  const fetchAllProducts = async () => {
    console.log("📡 Attempting to fetch all products...");
    try {
      const response = await fetch("http://localhost:8080/products/all");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching all products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword) => {
    if (!keyword) {
      fetchAllProducts();
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/products/search?keyword=${keyword}`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        console.error("Search failed with error:", data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return (
    <div className="homepage">
      <Navbar onSearch={handleSearch} />
      
      <SortProducts onSorted={setProducts} />
      
      {loading ? (
        <div className="loading-container" style={{ 
          textAlign: 'center', 
          padding: '40px', 
          fontSize: '1.2rem',
          color: '#666',
          width: '100%' 
        }}>
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id || product.product_id} product={product} />
            ))
          ) : (
            <div className="no-products" style={{ 
              textAlign: 'center', 
              gridColumn: '1 / -1', 
              padding: '40px', 
              color: '#666' 
            }}>
              <p>No products found.</p>
            </div>
          )}
        </div>
      )}
      
      <footer className="footer">
        <p>
          © 2025 E-Commerce | <a href="#">Terms & Conditions</a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
