import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "./global"; // Assuming this function gets the current user
import "./OrderHistory.css";

const Navbar = () => (
  <nav className="navbar">
    <h1 className="logo">E-Commerce</h1>
    <input type="text" placeholder="Search products..." className="search-bar" />
    <ul className="nav-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">Shop</a></li>
      <li><a href="#">Cart</a></li>
      <li><a href="#">Login</a></li>
      <li><a href="/order-history">Order History</a></li>
    </ul>
  </nav>
);

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const rawUser = getCurrentUser();
        console.log("Raw User:", rawUser); // Debug: Log the raw user object
        if (!rawUser) {
          console.warn("No user is logged in.");
          return;
        }

        const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
        console.log("User:", user); // Debug: Log the parsed user object
        const customerID = user.account_id || user.id;
        console.log("Customer ID:", customerID); // Debug: Log the customer ID
        if (!customerID) {
          console.error("No customer ID found.");
          return;
        }

        const response = await fetch(`http://localhost:8080/customers/shopping-history?customerID=${customerID}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("API Response Status:", response.status); // Debug: Log the API response status
        const data = await response.json();
        console.log("API Response Data:", data); // Debug: Log the actual response data

        if (!response.ok || !data || typeof data !== "object") {
          console.error("Failed to fetch order history:", response.status);
          setError("Failed to fetch order history");
          return;
        }

        setOrders(data); // Assume the data is the list of orders
      } catch (error) {
        console.error("Error fetching order history:", error);
        setError("Failed to fetch order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  return (
    <div className="order-history-container">
      <h2>Order History</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p>{error}</p>
      ) : orders.length === 0 ? (
        <p>No past orders found.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.invoiceId} className="order-item">
              <p><strong>Invoice ID:</strong> {order.invoiceId}</p>
              <p><strong>Purchaser:</strong> {order.purchaser.name} {order.purchaser.surname}</p>
              <p><strong>Email:</strong> {order.purchaser.email}</p>
              <p><strong>Status:</strong> {order.orderStatus}</p>
              <p><strong>Total:</strong> ${order.total_price.toFixed(2)}</p>
              <p><strong>Purchased Items:</strong> {Object.keys(order.purchased).length === 0 ? 'No items purchased' : `${Object.keys(order.purchased).length} items`}</p>
              <div className="order-actions">
                <button onClick={() => navigate(`/order/${order.invoiceId}`)}>View Details</button>
                <button 
                  onClick={() => navigate('/request-refund', { state: { order } })}
                  className="refund-button"
                >
                  Request Refund
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
