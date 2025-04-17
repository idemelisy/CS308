import React, { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import OrderHistory from "./OrderHistory";
import Navbar from "./components/Navbar"; // Güncellendi

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="product-card"
      onClick={() => navigate(`/product/${product.product_id}`)}
    >
      <img src={product.image} alt={product.productName} className="product-image" />
      <h2 className="product-title">{product.productName}</h2>
      <p className="product-price">${product.unit_price.toFixed(2)}</p>
      <p className="product-quantity">Stock: {product.stock}</p>
      <p className="product-description"> {product.description}</p>
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllProducts = () => {
    fetch("http://localhost:8080/products/all")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
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
