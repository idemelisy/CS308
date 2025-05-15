import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/product-managers/get-orders")
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const handleAdvanceOrderStatus = (order) => {
    fetch("http://localhost:8080/product-managers/advance-order-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
      .then((response) => response.json())
      .then((updatedOrder) => {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === updatedOrder._id ? updatedOrder : o
          )
        );
      })
      .catch((error) => console.error("Error advancing order status:", error));
  };

  return (
    <div className="orders-page">
      <h1>Order Management</h1>
      <ul>
        {orders.map((order) => (
          <li key={order._id}>
            <p><strong>Invoice ID:</strong> {order._id}</p>
            <p><strong>Purchaser Email:</strong> {order.purchaser.email}</p>
            <p><strong>Status:</strong> {order.orderStatus}</p>
            <p><strong>Total Price:</strong> ${order.total_price.toFixed(2)}</p>
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