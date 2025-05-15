import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "./global";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginResponse = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const loginData = await loginResponse.json();
      console.log("Login Response:", loginData);

      if (!loginResponse.ok) {
        alert("Login failed: " + loginData);
        return;
      }

      // Fetch wishlist data for customers
      let wishlist = [];
      if (loginData.account_id) {
        try {
          const wishlistResponse = await fetch(`http://localhost:8080/customers/get-wishlist?customerID=${loginData.account_id}`);
          if (wishlistResponse.ok) {
            wishlist = await wishlistResponse.json();
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }

      const userToSave = {
        userId: loginData.account_id || loginData.email,
        username: loginData.name || "User",
        email: loginData.email || formData.email,
        wishlist: wishlist, // Add wishlist to the user object
        wishlistNeedsUpdate: false // Add flag to track if wishlist needs updating
      };

      setCurrentUser(userToSave);
      const userObject = {
        account_id: loginData.account_id,
        email: loginData.email,
        name: loginData.name,
        wishlist: wishlist, // Add wishlist to localStorage
        wishlistNeedsUpdate: false // Add flag to localStorage
      };

      localStorage.setItem('currentUser', JSON.stringify(userObject));
      console.log("User saved to storage:", userToSave);

      const roleResponse = await fetch(
        `http://localhost:8080/instance?email=${formData.email}`
      );

      const roleData = await roleResponse.text();
      console.log("Role:", roleData);

      if (!roleResponse.ok) {
        alert("Failed to fetch user role.");
        return;
      }

      alert("Login Successful!");

      switch (roleData) {
        case "ProductManager":
          navigate("/product-managers"); // Navigate to ProductManager dashboard
          break;
        case "SalesManager":
          navigate("/sales-managers"); // Navigate to approval page for ProductManager and SalesManager
          break;
        case "Customer":
          navigate("/home");
          break;
        default:
          alert("Unknown user role!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="container" style={{ position: "relative", paddingTop: "3rem" }}>
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "20px",
          right: "150px",
          backgroundColor: "transparent",
          border: "none",
          color: "orange",
          textDecoration: "underline",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        ← Back
      </button>
  
      <h1 style={{ color: "orange" }}>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
  
        <label>Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
  
        <button type="submit" style={{ backgroundColor: "orange", color: "white" }}>
          Login
        </button>
      </form>
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );  
}

export default Login;
