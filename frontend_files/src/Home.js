import React from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

const products = [
  { id: 1, name: "Laptop", price: 999.99, quantity: 5, image: "https://via.placeholder.com/150" },
  { id: 2, name: "Smartphone", price: 699.99, quantity: 10, image: "https://via.placeholder.com/150" },
  { id: 3, name: "Headphones", price: 199.99, quantity: 15, image: "https://via.placeholder.com/150" },
  { id: 4, name: "Headphones", price: 199.99, quantity: 15, image: "https://via.placeholder.com/150" },
  { id: 5, name: "Headphones", price: 199.99, quantity: 15, image: "https://via.placeholder.com/150" },
  { id: 6, name: "Headphones", price: 199.99, quantity: 15, image: "https://via.placeholder.com/150" },

  { id: 7, name: "Headphones", price: 199.99, quantity: 15, image: "https://via.placeholder.com/150" },
  { id: 8, name: "Headphones", price: 199.99, quantity: 15, image: "https://via.placeholder.com/150" },
];

const Navbar = () => (
  <nav className="navbar">
    <h1 className="logo">E-Commerce</h1>
    <input type="text" placeholder="Search products..." className="search-bar" />
    <ul className="nav-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">Shop</a></li>
      <li><a href="#">Cart</a></li>
      <li><a href="#">Login</a></li>
    </ul>
  </nav>
);



const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <img src={product.image} alt={product.name} className="product-image" />
      <h2 className="product-title">{product.name}</h2>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <p className="product-quantity">Stock: {product.quantity}</p>
    </div>
  );
};


const Home = () => (
  <div className="homepage">
    <Navbar />
    <div className="product-grid" style={{ display: "flex", gap: "20px", overflowX: "auto", whiteSpace: "nowrap", padding: "20px" }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
    <footer className="footer">
      <p>© 2025 E-Commerce | <a href="#">Terms & Conditions</a></p>
    </footer>
  </div>
);

export default Home;