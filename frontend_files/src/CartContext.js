// CartContext.js - Düzeltilmiş hali

import React, { createContext, useContext, useState, useEffect } from "react";
import { normalizeProduct } from "./utils/normalizeProduct";
import { getCurrentUser } from "./global";
import { useNavigate } from "react-router-dom";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const rawUser = getCurrentUser();
        if (!rawUser) {
          console.warn("No user is logged in.");
          return;
        }

        const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
        const userId = user.account_id ?? user.email;

        if (!userId) {
          console.error("No user ID found in user object:", user);
          return;
        }

        const response = await fetch(`http://localhost:8080/customers/get-cart?customerID=${encodeURIComponent(userId)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch cart: ${response.status}`);
        }

        const cartMap = await response.json();

        const productIds = Object.keys(cartMap);
        const productPromises = productIds.map(async (product_id) => {
          const res = await fetch(`http://localhost:8080/products/${product_id}`);
          const product = await res.json();

          return {
            product_id,
            quantity: cartMap[product_id],
            name: product.name,
            image: product.image,
            unitPrice:  product.unitPrice ?? product.price ?? 0,
          };
        });

        const items = await Promise.all(productPromises);
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
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) {
        console.error("No logged-in user.");
        return;
      }

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

      const payload = {
        product_id: (product.product_id || product.id || "").toString(),
        name: product.name || "",
        model: product.model || "",
        serialNumber: product.serialNumber || "",
        description: product.description || "",
        unitPrice: product.unitPrice ?? 0,
        stock: product.stock ?? 0,
        category: product.category || "",
        warrantyStatus: product.warrantyStatus || "",
        distributorID: product.distributorID || ""
      };

      const response = await fetch(`http://localhost:8080/customers/add-to-cart?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add to cart: ${response.status} - ${errorText}`);
      }

      const normalizedProduct = normalizeProduct(product);
      setCartItems(prevItems => {
        const existing = prevItems.find(item => item.product_id === normalizedProduct.product_id);
        if (existing) {
          return prevItems.map(item =>
            item.product_id === normalizedProduct.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, normalizedProduct];
      });

    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err;
    }
  };

  const deleteFromCart = async (product) => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) {
        console.error("No logged-in user.");
        return;
      }

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      if (!user?.email) {
        console.error("User object missing email:", user);
        return;
      }

      await fetch(`http://localhost:8080/customers/delete-from-cart?email=${encodeURIComponent(user.email)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.product_id,
          name: product.name || "",
          model: product.model || "",
          serialNumber: product.serialNumber || "",
          description: product.description || "",
          unitPrice: product.unitPrice ?? 0,
          stock: product.stock || 0,
          category: product.category || "",
          warrantyStatus: product.warrantyStatus || "",
          distributorID: product.distributorID || ""
        }),
      });

      setCartItems(prevItems =>
        prevItems
          .map(item =>
            item.product_id === product.product_id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter(item => item.quantity > 0)
      );
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const checkout = () => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) {
        console.error("No logged-in user.");
        return;
      }

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

      const shoppingCart = cartItems.reduce((acc, item) => {
        acc[item.product_id] = item.quantity;
        return acc;
      }, {});

      const fakeInvoice = {
        name: user.username,
        surname: user.username,
        email: user.email,
        purchased: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          name: item.name,
          image: item.image,
          unitPrice: item.unitPrice // <<< Düzenlendi
        })),
        total_price: totalPrice,
        orderStatus: "pending",
        invoiceId: null
      };

      navigate("/invoice", { state: { invoice: fakeInvoice } });
    } catch (err) {
      console.error("Error preparing checkout:", err);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
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