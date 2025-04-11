// CartContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "./global";

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:8080/customers/get-cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(getCurrentUser()),
        });

        const data = await response.json();
        setCartItems(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (product) => {
    try {
      const currentUser = JSON.parse(getCurrentUser());
      const userEmail = currentUser.email;
      const response = await fetch("http://localhost:8080/customers/add-to-cart?email=" + userEmail, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      const data = await response.text();
      console.log("Add to Cart response:", data);

      setCartItems((prevItems) => {
        const newItems = { ...prevItems };
        const productId = product.id;
        
        newItems[productId] = (newItems[productId] || 0) + 1;
        
        return newItems;
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const deleteFromCart = async (product) => {
    try {
      const currentUser = JSON.parse(getCurrentUser());
      const userEmail = currentUser.email;

      const response = await fetch("http://localhost:8080/customers/delete-from-cart?email=" + userEmail, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      const data = await response.text();
      console.log("Remove from Cart response:", data);

      setCartItems((prevItems) => prevItems.filter(item => item !== product));
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const checkout = async () => {
    try {
      const response = await fetch("http://localhost:8080/customers/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getCurrentUser()),
      });

      const data = await response.json();
      console.log("Checkout response:", data);

      setCartItems([]);
    } catch (err) {
      console.error("Error during checkout:", err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, addToCart, deleteFromCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
};