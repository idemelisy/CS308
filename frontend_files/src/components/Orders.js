import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:8080/product-managers/get-orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAdvanceOrderStatus = async (order) => {
    try {
      const response = await fetch("http://localhost:8080/product-managers/advance-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!response.ok) throw new Error("Failed to update status");

      await fetchOrders(); // tekrar veri çek
    } catch (error) {
      console.error("Error advancing order status:", error);
    }
  };

  return (
    <div className="orders-page">
      <h1>Order Management</h1>
      <ul>
        {orders.map((order) => (
          <li key={order._id}>
            <p><strong>Invoice ID:</strong> {order.invoiceId}</p>
            <p><strong>Products:</strong></p>
            <ul>
              {Object.entries(order.purchased).map(([productId, quantity]) => (
                <li key={productId}>
                  <strong>{productId}</strong>: {quantity}
                </li>
              ))}
            </ul>
            <p><strong>Purchaser Email:</strong> {order.purchaser.email}</p>
            <p><strong>Status:</strong> {order.orderStatus}</p>
            <p><strong>Total Price:</strong> ${order.total_price.toFixed(2)}</p>
            <p><strong>Delivery Address:</strong> {order.address}</p>
            <button
              onClick={() => handleAdvanceOrderStatus(order)}
              disabled={order.orderStatus === "delivered"}
            >
              Advance Status
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
