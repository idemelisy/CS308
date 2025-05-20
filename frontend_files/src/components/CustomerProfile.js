import React from "react";
import { getCurrentUser } from "../global";

const CustomerProfile = () => {
  const user = getCurrentUser();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="customer-profile">
      <h2>My Profile</h2>
      <p><strong>Name:</strong> {user.username} {user.surname}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Delivery Address:</strong> {user.address || "Not set"}</p>
    </div>
  );
};

export default CustomerProfile;