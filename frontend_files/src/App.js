import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from "./AuthContext";
import { CartProvider } from './CartContext';
import { WishlistProvider } from "./WishlistContext";
import ProtectedRoute from './ProtectedRoute';
import Register from './Register';
import CustomerRegister from './CustomerRegister';
import SalesManagerRegister from './SalesManagerRegister';
import ProductManagerRegister from './ProductManagerRegister';
import Login from './Login';
import Continue from './Continue';
import Home from "./Home";
import Product from "./Product";
import OrderHistory from "./OrderHistory";
import Cart from "./Cart";
import InvoicePage from "./InvoicePage.js";
import ApprovalPage from './ApprovalPage';
import Wishlist from './Wishlist';
import RequestRefund from './RequestRefund';
import ProductManager from "./components/ProductManagerDashboard";
import Orders from "./components/Orders";
import Comments from "./components/Comments";
import SalesManagerDashboard from './components/SalesManagerDashboard.js';
import Invoices from './components/Invoices.js';
import CustomerProfile from './components/CustomerProfile.js';
import Refunds from './components/Refunds.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
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
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/invoice" element={<InvoicePage />} />
              <Route path="/approval-page" element={<ApprovalPage />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/request-refund" element={<RequestRefund />} />
              <Route path="/product-managers" element={<ProductManager />} />
              <Route path="/product-managers/orders" element={<Orders />} />
              <Route path="/product-managers/comments" element={<Comments />} />
              <Route path="/sales-managers" element={<SalesManagerDashboard />} />
              <Route path="/sales-managers/invoices" element={<Invoices />} />
              <Route path="/customer-profile" element={<CustomerProfile />} />
              <Route path="/sales-managers/refunds" element={<Refunds />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="container">
      <h1>Welcome to Our Store</h1>
      <p>Please choose an option:</p>
      <button onClick={() => navigate('/register')}>Register</button>
      <button onClick={() => navigate('/login')}>Login</button>
      <div className="footer">
        <button 
          onClick={() => navigate('/continue')}
          style={{ marginTop: "10px", backgroundColor: "#f0f0f0", color: "#333" }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

export default App;
