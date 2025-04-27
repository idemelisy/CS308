import React, { useEffect, useState } from "react";

const ApprovalPage = () => {
  const [comments, setComments] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch waiting comments on mount
  useEffect(() => {
    fetch("http://localhost:8080/product-managers/get-waiting-approvals")
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("Error fetching comments:", err));

    fetch("http://localhost:8080/product-managers/get-orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  const handleApprove = (comment) => {
    fetch("http://localhost:8080/product-managers/approve-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    })
      .then((res) => res.json())
      .then(() => {
        setComments((prev) => prev.filter((c) => c.comment_id !== comment.comment_id));
      })
      .catch((err) => console.error("Error approving comment:", err));
  };

  const handleReject = (comment) => {
    fetch("http://localhost:8080/product-managers/reject-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    })
      .then((res) => res.json())
      .then(() => {
        setComments((prev) => prev.filter((c) => c.comment_id !== comment.comment_id));
      })
      .catch((err) => console.error("Error rejecting comment:", err));
  };

  const handleAdvanceStatus = (order) => {
    fetch("http://localhost:8080/product-managers/advance-order-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
      .then((res) => res.json())
      .then((updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o.invoiceId === updatedOrder.invoiceId ? updatedOrder : o))
        );
      })
      .catch((err) => console.error("Error advancing status:", err));
  };

  return (
    <div>
      <h2>📝 Comments Waiting for Approval</h2>
      {comments.length === 0 ? (
        <p>No comments awaiting approval.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.comment_id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            <p><strong>User:</strong> {comment.userId}</p>
            <p><strong>Content:</strong> {comment.content}</p>
            <button onClick={() => handleApprove(comment)}>Approve</button>
            <button onClick={() => handleReject(comment)}>Reject</button>
          </div>
        ))
      )}

      <h2>📦 Orders</h2>
      {orders.length === 0 ? (
        <p>No orders.</p>
      ) : (
        orders.map((order) => (
          <div key={order.invoiceId} style={{ border: "1px solid #ccc", padding: "10px" }}>
            <p><strong>Customer:</strong> {order.purchaser.name}</p>
            <p><strong>Status:</strong> {order.orderStatus}</p>
            <button onClick={() => handleAdvanceStatus(order)}>Advance Order Status</button>
          </div>
        ))
      )}
    </div>
  );
};

export default ApprovalPage;
