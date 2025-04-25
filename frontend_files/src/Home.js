import React, { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "./global";
import Navbar from "./components/Navbar";


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
  ${typeof product.unitPrice === "number" ? product.unitPrice.toFixed(2) : "0.00"}
</p>


      <p className="product-quantity">Stock: {product.stock}</p>
      <p className="product-description">{product.description}</p>
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("📡 home is rendered");
  const fetchAllProducts = async () => {
    console.log("📡 Attempting to fetch all products...");
    try {
      const response = await fetch("http://localhost:8080/products/all");
      console.log("✅ Raw fetch response:", response);
      const data = await response.json();
      console.log("✅ Products received:", data);
      setProducts(Array.isArray(data) ? data : []);
;
    } catch (error) {
      console.error("❌ Error fetching all products:", error);
    } finally {
      setLoading(false);
    }
  };
/*
  const handleSearch = async (keyword) => {
    console.log("🔍 Search keyword:", keyword);
    if (!keyword) {
      console.log("🔄 Keyword empty — fetching all products again.");
      fetchAllProducts();
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/products/search?keyword=${keyword}`
      );
      console.log("🔍 Search response:", response);
      const data = await response.json();
      console.log("🔍 Search results:", data);
      setProducts(data);
    } catch (error) {
      console.error("❌ Search failed:", error);
    }
  };*/
  const handleSearch = async (keyword) => {
    console.log("Searching for keyword:", keyword); // Debugging search input
    if (!keyword) {
      fetchAllProducts(); // show all if search is cleared
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/products/search?keyword=${keyword}`);
      const data = await response.json();
      console.log("Search response:", data); // Log the search response
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
    console.log("🏠 Home component mounted.");
    fetchAllProducts();
  }, []);

  const handleSearch = async (keyword) => {
    if (!keyword) {
      fetchAllProducts(); // boşsa tüm ürünleri geri getir
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/products/search?keyword=${keyword}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  return (
    <div className="homepage">
      <Navbar onSearch={handleSearch} />
      <div
        className="product-grid"
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          padding: "20px",
        }}
      >
        {loading ? (
          <p>Loading products...</p>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
      <footer className="footer">
        <p>
          © 2025 E-Commerce | <a href="#">Terms & Conditions</a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
