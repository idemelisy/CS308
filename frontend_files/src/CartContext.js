// CartContext.js - Güncellenmiş hali (adres desteği eklenmiş)

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
  const [refetch, setRefetch] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(""); // ✅ yeni eklendi
  const navigate = useNavigate();

  useEffect(() => {
    const checkCartAfterConversion = sessionStorage.getItem('checkCartAfterConversion');
    if (checkCartAfterConversion === 'true') {
      sessionStorage.removeItem('checkCartAfterConversion');
      setRefetch(prev => !prev);
    }
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const rawUser = getCurrentUser();
        if (!rawUser) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
        if (!user.email) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        let cartMap = {};
        if (user.shopping_cart && Object.keys(user.shopping_cart).length > 0) {
          cartMap = user.shopping_cart;
        } else if (user.userType !== "guest") {
          try {
            const response = await fetch(`http://localhost:8080/customers/get-cart?customerID=${encodeURIComponent(user.userId ?? user.account_id)}`);
            if (!response.ok) throw new Error();
            cartMap = await response.json();
            user.shopping_cart = cartMap;
            localStorage.setItem('user', JSON.stringify(user));
          } catch (backendError) {
            if (!user.shopping_cart) {
              user.shopping_cart = {};
              localStorage.setItem('user', JSON.stringify(user));
            }
            cartMap = user.shopping_cart || {};
          }
        }

        const productIds = Object.keys(cartMap);
        const productPromises = productIds.map(async (product_id) => {
          try {
            const res = await fetch(`http://localhost:8080/products/${product_id}`);
            const product = await res.json();
            return {
              product_id,
              quantity: cartMap[product_id],
              name: product.name,
              image: product.image,
              unit_price: product.unit_price ?? product.unitPrice ?? product.price ?? 0,
            };
          } catch {
            return {
              product_id,
              quantity: cartMap[product_id],
              name: `Product ${product_id}`,
              image: null,
              unit_price: 999,
            };
          }
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
  }, [refetch]);

  const addToCart = async (product) => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) return;

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      if (!user.email) return;

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

      if (user.userType !== "guest") {
        try {
          const response = await fetch(`http://localhost:8080/customers/add-to-cart?email=${encodeURIComponent(user.email)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) throw new Error();

          if (!user.shopping_cart) user.shopping_cart = {};
          const productId = payload.product_id;
          user.shopping_cart[productId] = (user.shopping_cart[productId] || 0) + 1;
          localStorage.setItem('user', JSON.stringify(user));
        } catch {
          if (!user.shopping_cart) user.shopping_cart = {};
          const productId = payload.product_id;
          user.shopping_cart[productId] = (user.shopping_cart[productId] || 0) + 1;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        const shopping_cart = user.shopping_cart || {};
        const productId = payload.product_id;
        shopping_cart[productId] = (shopping_cart[productId] || 0) + 1;
        user.shopping_cart = shopping_cart;
        localStorage.setItem('user', JSON.stringify(user));
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

      setRefetch(prev => !prev);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const deleteFromCart = async (product) => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) return;

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      if (!user?.email) return;

      if (user.userType !== "guest") {
        try {
          const response = await fetch(`http://localhost:8080/customers/delete-from-cart?email=${encodeURIComponent(user.email)}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: product.product_id,
              name: product.name || "",
              model: product.model || "",
              serialNumber: product.serialNumber || "",
              description: product.description || "",
              unitPrice: product.unitPrice || product.unit_price || 0,
              stock: product.stock || 0,
              category: product.category || "",
              warrantyStatus: product.warrantyStatus || "",
              distributorID: product.distributorID || ""
            }),
          });

          if (!response.ok) throw new Error();

          if (user.shopping_cart && user.shopping_cart[product.product_id]) {
            if (user.shopping_cart[product.product_id] <= 1) {
              delete user.shopping_cart[product.product_id];
            } else {
              user.shopping_cart[product.product_id] -= 1;
            }
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch {
          if (user.shopping_cart && user.shopping_cart[product.product_id]) {
            if (user.shopping_cart[product.product_id] <= 1) {
              delete user.shopping_cart[product.product_id];
            } else {
              user.shopping_cart[product.product_id] -= 1;
            }
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      } else {
        const shopping_cart = user.shopping_cart || {};
        const productId = product.product_id;
        if (shopping_cart[productId]) {
          if (shopping_cart[productId] <= 1) {
            delete shopping_cart[productId];
          } else {
            shopping_cart[productId] -= 1;
          }
        }
        user.shopping_cart = shopping_cart;
        localStorage.setItem('user', JSON.stringify(user));
      }

      setCartItems(prevItems =>
        prevItems
          .map(item =>
            item.product_id === product.product_id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter(item => item.quantity > 0)
      );
      setRefetch(prev => !prev);
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const checkout = () => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) return;

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

      const shoppingCart = cartItems.reduce((acc, item) => {
        acc[item.product_id] = item.quantity;
        return acc;
      }, {});

      const fakeInvoice = {
        account_id: user.account_id || user.userId,
        name: user.username,
        surname: user.username,
        email: user.email,
        purchased: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          name: item.name,
          image: item.image,
          unit_price: item.unit_price || item.unitPrice
        })),
        total_price: totalPrice,
        orderStatus: "pending",
        wishlist: user.wishlist || [],
        delivery_address: deliveryAddress || "N/A" // ✅ adres invoice'a eklendi
      };

      const updatedUser = { ...user, wishlist: user.wishlist || [] };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/invoice", { state: { invoice: fakeInvoice } });
    } catch (err) {
      console.error("Error preparing checkout:", err);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.unit_price || item.unitPrice || 0) * (item.quantity || 0),
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
        deliveryAddress, // ✅ dışa açıldı
        setDeliveryAddress // ✅ dışa açıldı
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
