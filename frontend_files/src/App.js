import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
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
