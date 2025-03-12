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
    companyName: '', // New field for Sales Manager
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);  // Save to your DB or handle it
    navigate('/');
  };

  return (
    <div className="container">
      <h1>Register as a Sales Manager</h1>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <label>Surname</label>
        <input
          type="text"
          value={formData.surname}
          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <label>Company Name</label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default SalesManagerRegister;
