import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "./global";

export const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetch, setRefetch] = useState(false);
  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line
  }, [refetch]);

  const fetchWishlist = async () => {
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
      const response = await fetch(`http://localhost:8080/customers/get-wishlist?customerID=${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.status}`);
      }
      const data = await response.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) {
        console.error("No logged-in user.");
        return;
      }
      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      const userId = user.account_id ?? user.email;
      const response = await fetch(`http://localhost:8080/customers/add-wishlist?customerID=${encodeURIComponent(userId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add to wishlist: ${response.status} - ${errorText}`);
      }
      // Optionally, refetch wishlist or optimistically update
      fetchWishlist();
    } catch (err) {
      console.error("Error adding to wishlist:", err);
    }
  };

  const removeFromWishlist = async (product) => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) {
        console.error("No logged-in user.");
        return;
      }
      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      const userId = user.account_id ?? user.email;
      const response = await fetch(`http://localhost:8080/customers/drop-wishlist?customerID=${encodeURIComponent(userId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove from wishlist: ${response.status} - ${errorText}`);
      }
      // Optionally, refetch wishlist or optimistically update
     setRefetch(prev => !prev);
      
      // Uncomment the line below if you want to optimistically update the wishlist state
     // setWishlist(prev => prev.filter(item => item.id !== product.id && item.product_id !== product.product_id));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};