import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./auth";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = await login(formData.email, formData.password);
      console.log("Firebase Token:", token);

      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Send Firebase token to backend
        },
        body: JSON.stringify({ email: formData.email })
      });

      if (!response.ok) {
        throw new Error("Backend authentication failed");
      }

      console.log("Logged in successfully!");
      navigate("/"); // Redirect to homepage after successful login
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
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

        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register here</a></p>
    </div>
  );
}

export default Login;
