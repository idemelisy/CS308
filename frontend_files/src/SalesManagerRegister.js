// pages/SalesManagerRegister.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function SalesManagerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    companyName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType: "salesManager",
          ...formData,
        }),
      });
      
      const data = await response.text();
      console.log("Server Response:", data);

      if (response.ok) {
        alert("Registration Successful!");
        navigate("/");
      } else {
        alert("Error: " + data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="container">
      <h1>Register as a Sales Manager</h1>
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
