import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "./auth"; // Import Firebase signup function
import "./App.css";
import { setCurrentUser } from "./global";

function SalesManagerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    companyName: '',
  });

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType: "sales_manager", // Assuming your backend needs this
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          password: formData.password,
          additionalParams: { company_name: formData.companyName },
        }),
      });

      const data = await response.text();
      console.log("Server Response:", data);

      if (response.ok) {
        alert("Registration Successful!");
        setCurrentUser(data); // Sets the CURRENT_USER as a GLOBAL variable
        navigate("/sales-managers");
        setError(null);
      } else {
        alert("Error: " + data);
        setError(data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
      setError("Something went wrong.");
    }
  };

  return (
    <div className="container">
      <h1>Register as a Sales Manager</h1>
      {error && <p className="error">{error}</p>} 
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        
        <label>Surname</label>
        <input type="text" value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} required />
        
        <label>Email</label>
        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        
        <label>Company Name</label>
        <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
        
        <label>Password</label>
        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default SalesManagerRegister;
