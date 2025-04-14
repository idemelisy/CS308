import React, { createContext, useContext, useState, useEffect } from "react";
import { normalizeProduct } from "./utils/normalizeProduct";
import { getCurrentUser } from "./global";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const rawUser = getCurrentUser();
        if (!rawUser) {
          console.warn("No user is logged in.");
          return;
        }

        const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

        const response = await fetch(`http://localhost:8080/customers/get-cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });

        const data = await response.json();
        const cartMap = data.shopping_cart || {};

        const items = Object.entries(cartMap).map(([product_id, quantity]) => ({
          product_id,
          quantity,
          name: "Product " + product_id, // Placeholder, ideally you’d fetch real product data
          unit_price: 10.0,
          image: "",
        }));

        setCartItems(items);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const addToCart = async (product) => {
    const normalizedProduct = normalizeProduct(product);

    if (
      !normalizedProduct.product_id ||
      !normalizedProduct.name ||
      normalizedProduct.unit_price == null
    ) {
      console.warn("Invalid product passed to addToCart:", normalizedProduct);
      return;
    }

    try {
      const rawUser = getCurrentUser();
      if (!rawUser) return;

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      const userEmail = user.email;

      console.log("🛒 Sending product to backend:", normalizedProduct);

      await fetch(`http://localhost:8080/customers/add-to-cart?email=${userEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedProduct),
      });

      setCartItems((prevItems) => {
        const existing = prevItems.find(
          (item) => item.product_id === normalizedProduct.product_id
        );
        if (existing) {
          return prevItems.map((item) =>
            item.product_id === normalizedProduct.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevItems, { ...normalizedProduct, quantity: 1 }];
        }
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const deleteFromCart = async (product) => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) return;

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      const userEmail = user.email;

      await fetch(`http://localhost:8080/customers/delete-from-cart?email=${userEmail}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.product_id }),
      });

      setCartItems((prevItems) =>
        prevItems
          .map((item) =>
            item.product_id === product.product_id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const checkout = async () => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) return;

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

      const response = await fetch("http://localhost:8080/customers/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      console.log("Checkout response:", data);

      setCartItems([]); // Clear cart on success
    } catch (err) {
      console.error("Error during checkout:", err);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.unit_price || 0) * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        deleteFromCart,
        checkout,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
