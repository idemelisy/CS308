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
      const userId = user.userId||user.account_id;
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
      console.log("Current user in addToWishlist:", rawUser);

      if (!rawUser) {
        console.error("No logged-in user.");
        throw new Error("You must be logged in to add items to wishlist");
      }

      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      console.log("Parsed user:", user);

      if (!(user.userId || user.account_id)) {
        console.error("Invalid user data:", user);
        console.log("User object:---------", user);
        throw new Error("Invalid user data - no userId found");
      }

      const userId =  user.account_id ||user.userId ;

      console.log("Using userId:", userId);

      const response = await fetch(`http://localhost:8080/customers/add-wishlist?customerID=${encodeURIComponent(user.account_id||user.userId)}`, {
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

      // Update wishlist state
      setWishlist(prevWishlist => [...prevWishlist, product]);
      
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      throw err;
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
      const userId = user.userId || user.account_id;
      const response = await fetch(`http://localhost:8080/customers/drop-wishlist?customerID=${encodeURIComponent(userId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product),
      });
      window.location.reload();
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove from wishlist: ${response.status} - ${errorText}`);
      }
      
      // Update wishlist state optimistically
      setWishlist(prev => prev.filter(item => 
        item.product_id !== product.product_id && 
        item.id !== product.id
      ));
      
      // Trigger a refetch to ensure consistency
      setRefetch(prev => !prev);
      
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      throw err; // Re-throw the error so the component can handle it
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