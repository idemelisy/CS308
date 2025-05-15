import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./OrderHistory.css";
import { getCurrentUser } from "./global";
import { FaEye, FaFileInvoiceDollar, FaHistory, FaShoppingBag } from 'react-icons/fa';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:8080/customers/shopping-history?customerID=${ user.account_id||user.userId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message || "Failed to load order history");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusClass = (status) => {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('deliver')) return 'status-delivered';
    if (statusLower.includes('process')) return 'status-processing';
    if (statusLower.includes('cancel')) return 'status-cancelled';
    return 'status-pending';
  };
  
  const getStatusTagClass = (status) => {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('deliver')) return 'status-tag-delivered';
    if (statusLower.includes('process')) return 'status-tag-processing';
    if (statusLower.includes('cancel')) return 'status-tag-cancelled';
    return 'status-tag-pending';
  };

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h2>Order History</h2>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="action-view">Try Again</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <FaHistory size={50} color="#ddd" />
          <p>You haven't placed any orders yet.</p>
          <Link to="/home" className="shop-now-btn">Start Shopping</Link>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.invoiceId} className="order-item">
              <div className={`order-status-indicator ${getStatusClass(order.orderStatus)}`}></div>
              
              <div className="order-header">
                <p className="order-id">
                  <strong>Invoice #{order.invoiceId}</strong>
                </p>
                <p className="order-date">{formatDate(order.date)}</p>
              </div>
              
              <div className="order-details">
                <div className="order-detail-group">
                  <p className="detail-label">Customer</p>
                  <p className="detail-value">{order.purchaser.name} {order.purchaser.surname}</p>
                </div>
                
                <div className="order-detail-group">
                  <p className="detail-label">Status</p>
                  <span className={`order-status ${getStatusTagClass(order.orderStatus)}`}>
                    {order.orderStatus || "Pending"}
                  </span>
                </div>
                
                <div className="order-detail-group">
                  <p className="detail-label">Total</p>
                  <p className="order-total">${order.total_price.toFixed(2)}</p>
                </div>
              </div>
              
              {Object.keys(order.purchased).length > 0 && (
                <div className="order-items-preview">
                  {Object.entries(order.purchased).slice(0, 5).map(([productId, quantity]) => (
                    <div key={productId} className="order-item-preview">
                      <div className="order-item-image-placeholder"></div>
                    </div>
                  ))}
                  {Object.keys(order.purchased).length > 5 && (
                    <div className="order-item-count">
                      +{Object.keys(order.purchased).length - 5}
                    </div>
                  )}
                </div>
              )}
              
              <div className="order-actions">
                <button 
                  onClick={() => navigate('/request-refund', { state: { order } })}
                  className="action-refund"
                >
                  <FaFileInvoiceDollar /> Request Refund
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
