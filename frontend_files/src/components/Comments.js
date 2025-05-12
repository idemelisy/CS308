import React, { useEffect, useState } from "react";

const Comments = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/product-managers/get-waiting-approvals")
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("Error fetching comments:", error));
  }, []);

  const handleApproveComment = (comment) => {
    fetch("http://localhost:8080/product-managers/approve-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    })
      .then((response) => response.json())
      .then((updatedComment) => {
        setComments((prevComments) =>
          prevComments.filter((c) => c._id !== updatedComment._id)
        );
      })
      .catch((error) => console.error("Error approving comment:", error));
  };

  const handleRejectComment = (comment) => {
    fetch("http://localhost:8080/product-managers/reject-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    })
      .then((response) => response.json())
      .then((updatedComment) => {
        setComments((prevComments) =>
          prevComments.filter((c) => c._id !== updatedComment._id)
        );
      })
      .catch((error) => console.error("Error rejecting comment:", error));
  };

  return (
    <div className="comments-page">
      <h1>Comment Management</h1>
      <ul>
        {comments.map((comment) => (
          <li key={comment._id}>
            <p><strong>Product ID:</strong> {comment.productId}</p>
            <p><strong>User Email:</strong> {comment.userEmail}</p>
            <p><strong>Content:</strong> {comment.content}</p>
            <p><strong>Status:</strong> {comment.approvalStatus}</p>
            <button onClick={() => handleApproveComment(comment)}>Approve</button>
            <button onClick={() => handleRejectComment(comment)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Comments;