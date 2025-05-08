import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from './global';
import './RequestRefund.css';

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
        const customerID = user.account_id || user.id;

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
      const refundAmount = Math.round(product.unitPrice * quantity * 100);

      console.log('Requesting refund with:', {
        productId,
        quantity,
        refundAmount,
        product
      });

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      const customer = {
        account_id: user.account_id,
        name: user.name,
        surname: user.surname,
        email: user.email
      };

      console.log('Sending request to:', `http://localhost:8080/customers/request-refund?productID=${productId}&refund_amount=${refundAmount}`);
      console.log('With customer data:', customer);

      const response = await fetch(`http://localhost:8080/customers/request-refund?productID=${productId}&refund_amount=${refundAmount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: customer.account_id,
          name: customer.name,
          surname: customer.surname,
          email: customer.email
        })
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
    return <div className="refund-container">Loading...</div>;
  }

  return (
    <div className="refund-container">
      <h2>Request a Refund</h2>
      {error && <div className="error-message">{error}</div>}
      
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
          <p>Order ID: #{selectedOrder.invoiceId}</p>
          <p>Date: {new Date(selectedOrder.date).toLocaleDateString()}</p>
          <p>Total Amount: ${selectedOrder.total_price.toFixed(2)}</p>
          
          <h4>Products in this Order:</h4>
          <div className="products-list">
            {Object.entries(selectedOrder.purchased).map(([productId, quantity]) => (
              <div key={productId} className="product-item">
                <div className="product-info">
                  <p>
                    <strong>Product:</strong> {productDetails[productId]?.name || 'Loading...'} 
                    <span className="product-id">(ID: {productId})</span>
                  </p>
                  <p><strong>Quantity Purchased:</strong> {quantity}</p>
                  {productDetails[productId]?.unitPrice && (
                    <p><strong>Price per Unit:</strong> ${productDetails[productId].unitPrice.toFixed(2)}</p>
                  )}
                  <div className="refund-quantity-input">
                    <label>Quantity to Refund:</label>
                    <input
                      type="number"
                      value={refundQuantities[productId] || 1}
                      onChange={(e) => handleRefundQuantityChange(productId, parseInt(e.target.value))}
                      min="1"
                      max={quantity}
                      required
                    />
                    <span className="max-quantity">(Max: {quantity})</span>
                  </div>
                  {productDetails[productId]?.unitPrice && refundQuantities[productId] && (
                    <p className="refund-total">
                      <strong>Refund Total:</strong> ${(productDetails[productId].unitPrice * refundQuantities[productId]).toFixed(2)}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleRefundRequest(productId)}
                  className="refund-button"
                >
                  Request Refund
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