// 
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from './ProtectedRoute';//protected route ile access sadece gereklilere
import Register from './Register';
import CustomerRegister from './CustomerRegister';
import SalesManagerRegister from './SalesManagerRegister';
import ProductManagerRegister from './ProductManagerRegister';
import Login from './Login';
import Continue from './Continue';
import Home from "./Home";
import Product from "./Product";
import OrderHistory from "./OrderHistory";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/customer" element={<CustomerRegister />} />
          <Route path="/register/sales-manager" element={<SalesManagerRegister />} />
          <Route path="/register/product-manager" element={<ProductManagerRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/continue" element={<Continue />} />
          <Route path="/home" element={<Home />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/order-history" element={<OrderHistory />} /> {/* Added Order History Route */}
      
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function Welcome() {
  return (
    <div className="container">
      <h1>Welcome to Our Store</h1>
      <p>Please choose an option:</p>
      <button onClick={() => window.location.href = '/register'}>Register</button>
      <button onClick={() => window.location.href = '/login'}>Login</button>
      <div className="footer">
        <p>Or <Link to="/continue">Continue without logging in</Link></p>
      </div>
    </div>
  );
}

export default App;
