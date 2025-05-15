import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser } from "./global";
import "./App.css";

function GuestConversion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });
  const [currentUser, setCurrentUserState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.userType !== "guest") {
      // Redirect non-guest users to home
      navigate("/home");
      return;
    }
    setCurrentUserState(user);
    setLoading(false);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the guest cart
      const guestUser = getCurrentUser();
      const guestCart = guestUser?.shopping_cart || {};
      
      // Register a new customer account
      const registerResponse = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType: "customer",
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          password: formData.password,
          additionalParams: {},
        }),
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        throw new Error(errorText || "Failed to register account");
      }

      const newCustomer = await registerResponse.json();
      
      // Create new user with guest cart
      const newUser = {
        userId: newCustomer.account_id,
        username: newCustomer.name,
        email: newCustomer.email,
        wishlist: guestUser.wishlist || [],
        wishlistNeedsUpdate: false,
        userType: "customer",
        shopping_cart: guestCart  // Use the guest's cart
      };
      
      // Save directly to localStorage first
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Then use the setCurrentUser function
      setCurrentUser(newUser);
      
      // Now sync the cart with the database
      if (Object.keys(guestCart).length > 0) {
        console.log("Syncing cart to database...");
        
        // For each product in the cart, add it to the database
        for (const [productId, quantity] of Object.entries(guestCart)) {
          try {
            // Fetch product details to get required information
            const productResponse = await fetch(`http://localhost:8080/products/${productId}`);
            
            if (!productResponse.ok) {
              console.warn(`Couldn't fetch details for product ${productId}, using minimal info`);
              
              // Try to add with minimal info
              for (let i = 0; i < quantity; i++) {
                await fetch(`http://localhost:8080/customers/add-to-cart?customerID=${encodeURIComponent(newUser.userId)}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ product_id: productId }),
                });
              }
              
              continue;
            }
            
            const product = await productResponse.json();
            
            // Use bulk add if available, otherwise add one by one
            try {
              // Try bulk add first (if your API supports it)
              await fetch(`http://localhost:8080/customers/add-to-cart-bulk?customerID=${encodeURIComponent(newUser.userId)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  product_id: productId,
                  quantity: quantity,
                  product: product
                }),
              });
            } catch (bulkError) {
              console.log("Bulk add not supported, adding items one by one");
              
              // Fall back to adding one by one
              for (let i = 0; i < quantity; i++) {
                await fetch(`http://localhost:8080/customers/add-to-cart?customerID=${encodeURIComponent(newUser.userId)}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    product_id: product.product_id || productId,
                    name: product.name || "",
                    model: product.model || "",
                    serialNumber: product.serialNumber || "",
                    description: product.description || "",
                    unitPrice: product.unitPrice || product.price || 0,
                    stock: product.stock || 0,
                    category: product.category || "",
                    warrantyStatus: product.warrantyStatus || "",
                    distributorID: product.distributorID || ""
                  }),
                });
              }
            }
            
            console.log(`Added product ${productId} to database cart`);
          } catch (error) {
            console.error(`Error syncing product ${productId} to database:`, error);
          }
        }
        
        console.log("Cart synced to database successfully");
      }
      
      alert("Your account has been created and your cart has been transferred!");
      
      // Force page reload and navigation
      window.location.href = "/home";
    } catch (error) {
      console.error("Error converting account:", error);
      setError(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Convert Guest Account</h1>
      <p>Create an account to save your shopping cart and continue shopping.</p>
      
      {error && <p className="error">{error}</p>}
      
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

        <label>Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Converting..." : "Convert to Regular Account"}
        </button>
      </form>
      
      <p>
        <button 
          onClick={() => navigate("/home")} 
          className="secondary-button"
          style={{ backgroundColor: "#f0f0f0", color: "#333", marginTop: "10px" }}
        >
          Continue as Guest
        </button>
      </p>
    </div>
  );
}

export default GuestConversion; 