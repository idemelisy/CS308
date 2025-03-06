// pages/Register.js
import React from 'react';
import { Link } from 'react-router-dom';
import './App.css'; // If you want to apply styles from your main CSS file

function Register() {
  return (
    <div className="container">
      <h1>Register</h1>
      <p>Please choose a role to register:</p>
      <div className="button-container">
        <Link to="/register/customer">
          <button>Customer</button>
        </Link>
        <Link to="/register/sales-manager">
          <button>Sales Manager</button>
        </Link>
        <Link to="/register/product-manager">
          <button>Product Manager</button>
        </Link>
      </div>
    </div>
  );
}

export default Register;
