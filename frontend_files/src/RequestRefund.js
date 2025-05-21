import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from './global';
import './RequestRefund.css';
import { FaUndo, FaArrowLeft } from 'react-icons/fa';

const RequestRefund = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [refundQuantities, setRefundQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const rawUser = getCurrentUser();
        if (!rawUser) {
          setError('Please log in to request a refund');
          setLoading(false);
          return;
        }

        const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
        const customerID = user.account_id ?? user.userId;

        const response = await fetch(`http://localhost:8080/customers/shopping-history?customerID=${customerID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);

        // If order was passed through navigation state, set it as selected
        if (location.state?.order) {
          setSelectedOrder(location.state.order);
        }
      } catch (err) {
        setError('Error loading orders: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [location.state]);

  // Fetch product details when an order is selected
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!selectedOrder) return;

      const details = {};
      for (const productId of Object.keys(selectedOrder.purchased)) {
        try {
          const response = await fetch(`http://localhost:8080/products/${productId}`);
          if (response.ok) {
            const product = await response.json();
            details[productId] = product;
            // Initialize refund quantity for this product
            setRefundQuantities(prev => ({
              ...prev,
              [productId]: 1 // Default to 1 item
            }));
          }
        } catch (err) {
          console.error(`Error fetching product ${productId}:`, err);
        }
      }
      setProductDetails(details);
    };

    fetchProductDetails();
  }, [selectedOrder]);

  const handleRefundQuantityChange = (productId, quantity) => {
    const maxQuantity = selectedOrder.purchased[productId];
    const newQuantity = Math.min(Math.max(1, quantity), maxQuantity);
    setRefundQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleRefundRequest = async (productId) => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) {
        setError('Please log in to request a refund');
        return;
      }

      const quantity = refundQuantities[productId];
      if (!quantity || quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }

      const product = productDetails[productId];
      // Convert refund amount to integer (cents)
      //const refundAmount = Math.round(product.unitPrice * quantity * 100);
      const refundAmount = quantity;

      console.log('Requesting refund with:', {
        productId,
        quantity,
        refundAmount,
        product
      });

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      const customer = {
        account_id: user.account_id ?? user.userId,
        name: user.name ?? user.username,
        surname: user.surname ?? "",
        email: user.email
      };

      console.log('Sending request to:', `http://localhost:8080/customers/request-refund?productID=${productId}&invoiceID=${selectedOrder.invoiceId}&refund_amount=${refundAmount}`);
      console.log('With customer data:', customer);

      const response = await fetch(`http://localhost:8080/customers/request-refund?productID=${productId}&invoiceID=${selectedOrder.invoiceId}&refund_amount=${refundAmount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer)
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to request refund: ${response.status} - ${responseText}`);
      }

      alert('Refund request submitted successfully!');
      navigate('/order-history');
    } catch (err) {
      console.error('Error in handleRefundRequest:', err);
      setError('Error submitting refund request: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="refund-container">
        <h2>Request a Refund</h2>
        <div className="loading-state" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 0'
        }}>
          <div className="loading-spinner" style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #FF921C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="refund-container">
      <h2>Request a Refund</h2>
      {error && <div className="error-message">{error}</div>}
      
      <button 
        onClick={() => navigate('/order-history')}
        className="back-button"
      >
        <FaArrowLeft /> Back to Order History
      </button>
      
      <div className="form-group">
        <label>Select Order:</label>
        <select 
          value={selectedOrder ? selectedOrder.invoiceId : ''} 
          onChange={(e) => {
            const order = orders.find(o => o.invoiceId === e.target.value);
            setSelectedOrder(order);
          }}
          required
        >
          <option value="">Select an order</option>
          {orders.map(order => (
            <option key={order.invoiceId} value={order.invoiceId}>
              Order #{order.invoiceId} - ${order.total_price.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <div className="order-details">
          <h3>Order Details</h3>
          <div style={{marginBottom: '18px'}}>
            <div style={{fontSize: '1rem', color: '#333'}}><b>Order ID:</b> #{selectedOrder.invoiceId}</div>
            <div style={{fontSize: '1rem', color: '#333'}}><b>Date:</b> {new Date(selectedOrder.date).toLocaleDateString()}</div>
            <div style={{fontSize: '1rem', color: '#333'}}><b>Total Amount:</b> ${selectedOrder.total_price.toFixed(2)}</div>
          </div>
          <h4>Products in this Order:</h4>
          <div className="products-list">
            {Object.entries(selectedOrder.purchased).map(([productId, quantity]) => (
              <div key={productId} className="product-item basic-card">
                <div className="basic-title">{productDetails[productId]?.name || 'Loading...'}</div>
                <div className="basic-id">ID: {productId}</div>
                <div className="basic-row">Price per Unit: <span>${productDetails[productId]?.unitPrice ? productDetails[productId].unitPrice.toFixed(2) : '-'}</span></div>
                <div className="basic-row">Quantity Purchased: <span>{quantity}</span></div>
                <div className="basic-row">
                  Quantity to Refund:
                  <input
                    type="number"
                    value={refundQuantities[productId] || 1}
                    onChange={(e) => handleRefundQuantityChange(productId, parseInt(e.target.value))}
                    min="1"
                    max={quantity}
                    required
                    className="basic-input"
                  />
                  <span className="max-quantity">(Max: {quantity})</span>
                </div>
                <div className="basic-row" style={{color: '#e63946', fontWeight: 600}}>
                  Refund Total: ${productDetails[productId]?.unitPrice && refundQuantities[productId] ? (productDetails[productId].unitPrice * refundQuantities[productId]).toFixed(2) : '-'}
                </div>
                <button 
                  onClick={() => handleRefundRequest(productId)}
                  className="basic-refund-btn"
                >
                  <FaUndo style={{marginRight: '8px'}}/> Request Refund
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestRefund; 