import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import products from './data/products';
import './Home.css';

function Home() {
  return (
    <>
      <Navbar />
      <div className="home-container">
        <h1>Our Products</h1>
        <div className="product-list">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;