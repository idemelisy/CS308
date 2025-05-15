import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "./global";
import { v4 as uuidv4 } from "uuid";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Validate user login via POST /login
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
      let shoppingCart = {};
      if (loginData.account_id) {
        try {
          const wishlistResponse = await fetch(`http://localhost:8080/customers/get-wishlist?customerID=${loginData.account_id}`);
          if (wishlistResponse.ok) {
            wishlist = await wishlistResponse.json();
          }
          
          // Also fetch shopping cart
          const cartResponse = await fetch(`http://localhost:8080/customers/get-cart?customerID=${loginData.account_id}`);
          if (cartResponse.ok) {
            shoppingCart = await cartResponse.json();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      const userToSave = {
        userId: loginData.account_id || loginData.email,
        username: loginData.name || "User",
        email: loginData.email || formData.email,
        wishlist: wishlist, // Add wishlist to the user object
        wishlistNeedsUpdate: false, // Add flag to track if wishlist needs updating
        userType: "customer", // Add user type
        shopping_cart: shoppingCart // Add shopping cart to the user object
      };
  
      setCurrentUser(userToSave);
      /*const userObject = {
        account_id: loginData.account_id,   // <- important
        email: loginData.email,
        name: loginData.name,
        wishlist: wishlist, // Add wishlist to localStorage
        wishlistNeedsUpdate: false, // Add flag to localStorage
        userType: "customer" // Add user type
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userObject));*/
      console.log("User saved to storage:", userToSave);
  
      // Step 3: Fetch role using GET /instance?email=...
      const roleResponse = await fetch(
        `http://localhost:8080/instance?email=${formData.email}`
      );

      const roleData = await roleResponse.text(); // Assuming backend returns plain text like "ProductManager"
      console.log("Role:", roleData);

      if (!roleResponse.ok) {
        alert("Failed to fetch user role.");
        return;
      }

      // Step 4: Navigate based on role
      alert("Login Successful!");

      switch (roleData) {
        case "ProductManager":
        case "SalesManager":
          navigate("/approval-page"); // Navigate to approval page for ProductManager and SalesManager
          break;
        case "Customer":
          navigate("/home"); // Navigate to home page for Customer
          break;
        default:
          alert("Unknown user role!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  const handleGuestLogin = async () => {
    try {
      // Generate a unique guest ID
      const guestId = uuidv4();
      const uniqueEmail = `guest_${guestId}@guest.mail`;
      
      // Register guest user with backend
      const registerResponse = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userType: "guest",
          name: "Guest",
          surname: "User",
          email: uniqueEmail,
          password: "guest123",
          additionalParams: {}
        })
      });
      
      if (!registerResponse.ok) {
        throw new Error("Failed to register guest user");
      }
      
      const guestData = await registerResponse.json();
      console.log("Guest registered:", guestData);
      
      // Create guest user object
      const guestUser = {
        userId: guestData.account_id,
        username: "Guest",
        email: uniqueEmail,
        wishlist: [],
        wishlistNeedsUpdate: false,
        userType: "guest",
        shopping_cart: {}
      };
      
      // Save guest user to local storage
      setCurrentUser(guestUser);
      console.log("Guest user created:", guestUser);
      
      // Navigate to home page
      navigate("/home");
    } catch (error) {
      console.error("Error creating guest account:", error);
      alert("Failed to continue as guest.");
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
      <button 
        onClick={handleGuestLogin} 
        style={{ marginTop: "10px", backgroundColor: "#f0f0f0", color: "#333" }}
      >
        Continue as Guest
      </button>
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default Login;
