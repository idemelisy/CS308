import React, { useEffect, useState } from "react";

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/sales-managers/waiting-approvals")
      .then((res) => res.json())
      .then((data) => setRefunds(data))
      .catch((err) => {
        setRefunds([]);
        console.error("Error fetching refunds:", err);
      });
  }, []);

  const handleApprove = (refund) => {
    fetch("http://localhost:8080/sales-managers/approve-refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refund),
    })
      .then((res) => res.json())
      .then(() => {
        setRefunds((prev) => prev.filter((r) => r._id !== refund._id));
      });
  };

  const handleReject = (refund) => {
    fetch("http://localhost:8080/sales-managers/reject-refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refund),
    })
      .then((res) => res.json())
      .then(() => {
        setRefunds((prev) => prev.filter((r) => r._id !== refund._id));
      });
  };

  return (
    <div>
      <h1>Refund Requests</h1>
      {Array.isArray(refunds) && refunds.length === 0 ? (
        <p>No refund requests waiting for approval.</p>
      ) : (
        <ul>
          {Array.isArray(refunds) &&
          refunds.map((refund) => (
            <li key={refund._id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
              <p><strong>Customer:</strong> {refund.refundCustomer?.email}</p>
              <p><strong>Product ID:</strong> {refund.refund_productID}</p>
              <p><strong>Amount:</strong> {refund.refund_amount}</p>
              <p><strong>Status:</strong> {refund.approvalStatus}</p>
              <button onClick={() => handleApprove(refund)} style={{ marginRight: "10px" }}>Approve</button>
              <button onClick={() => handleReject(refund)}>Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Refunds;