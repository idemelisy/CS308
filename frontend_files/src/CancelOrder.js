import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CancelOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return <div>No order selected for cancellation.</div>;
  }

  const handleCancel = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/customers/cancel-order?invoiceID=${order.invoiceId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to cancel order");
      alert("Order cancelled successfully!");
      navigate("/order-history");
    } catch (err) {
      alert("Failed to cancel order. Please try again.");
    }
  };

  return (
    <div className="cancel-order-container">
      <h2>Cancel Order</h2>
      <p>
        Are you sure you want to cancel order <b>#{order.invoiceId}</b>?
      </p>
      <button onClick={handleCancel} className="cancel-confirm-btn">
        Yes, Cancel Order
      </button>
      <button onClick={() => navigate("/order-history")} className="cancel-back-btn">
        No, Go Back
      </button>
    </div>
  );
};

export default CancelOrder;