import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = "test@test.com"; // Gerekirse AuthContext'ten alınabilir

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:8080/customers/get-cart?email=${email}`);
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
      const response = await fetch("http://localhost:8080/customers/add-to-cart?email=" + email, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      const data = await response.text();
      console.log("Add to Cart response:", data);

      setCartItems((prevItems) => [...prevItems, product]);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const deleteFromCart = async (productId) => {
    try {
      const response = await fetch("http://localhost:8080/customers/delete-from-cart?email=" + email, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.text();
      console.log("Remove from Cart response:", data);

      setCartItems((prevItems) => prevItems.filter(item => item.id !== productId));
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const checkout = async () => {
    try {
      const response = await fetch("http://localhost:8080/customers/checkout?email=" + email, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
