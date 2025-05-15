import React, { createContext, useContext, useState, useEffect } from "react";
import { normalizeProduct } from "./utils/normalizeProduct";
import { getCurrentUser } from "./global";
import { useNavigate } from "react-router-dom"; 

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);


export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null); // ✅ for global invoice access
  const navigate = useNavigate();

  // Add a refetch state to trigger cart refresh
  const [refetch, setRefetch] = useState(false);
  
  useEffect(() => {
    // Check if we just converted from a guest account
    const checkCartAfterConversion = sessionStorage.getItem('checkCartAfterConversion');
    if (checkCartAfterConversion === 'true') {
      console.log("Detected post-conversion navigation, ensuring cart state is preserved");
      sessionStorage.removeItem('checkCartAfterConversion');
      
      // Force a refetch
      setRefetch(prev => !prev);
    }
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const rawUser = getCurrentUser();
        console.log("Raw User:", rawUser);

        if (!rawUser) {
          console.warn("No user is logged in.");
          setCartItems([]);
          setLoading(false);
          return;
        }

        const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
        console.log("User:", user);

        if (!user.email) {
          console.error("No email found in user object:", user);
          setCartItems([]);
          setLoading(false);
          return;
        }

        let cartMap = {};
        
        // Always check local cart first (whether guest or regular user)
        if (user.shopping_cart && Object.keys(user.shopping_cart).length > 0) {
          console.log("Using local cart", user.shopping_cart);
          cartMap = user.shopping_cart;
        } else if (user.userType !== "guest") {
          // If no local cart and user is a regular user, fetch from backend
          try {
            const response = await fetch(`http://localhost:8080/customers/get-cart?email=${encodeURIComponent(user.email)}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch cart: ${response.status}`);
            }

            cartMap = await response.json();
            
            // Also update the local shopping_cart
            user.shopping_cart = cartMap;
            localStorage.setItem('user', JSON.stringify(user));
          } catch (backendError) {
            console.error("Backend error fetching cart:", backendError);
            
            // Initialize empty shopping_cart if needed
            if (!user.shopping_cart) {
              user.shopping_cart = {};
              localStorage.setItem('user', JSON.stringify(user));
            }
            
            cartMap = user.shopping_cart || {};
          }
        }
        
        console.log("Cart Map:", cartMap);

        if (!cartMap || typeof cartMap !== "object") {
          console.warn("Invalid cart data received");
          setCartItems([]);
          setLoading(false);
          return;
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
          } catch (error) {
            console.warn(`Error fetching product ${product_id}:`, error);
            // Return a placeholder product if we can't fetch the real one
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
  }, [refetch]); // Add refetch dependency to trigger re-fetch when needed

  const addToCart = async (product) => {
    console.log("Adding product to cart:", product);
  
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) {
        console.error("No logged-in user.");
        return;
      }
  
      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      console.log("User in addToCart:", user);
      
      if (!user.email) {
        console.error("No email found in user object:", user);
        return;
      }
  
      const payload = {
        product_id: (product.product_id || product.id || "").toString(),
        name: product.name || "",
        model: product.model || "",
        serialNumber: product.serialNumber || "",
        description: product.description || "",
        unitPrice: product.unitPrice ?? product.unit_price ?? 0,  // ✅ support both unitPrice or unit_price
        stock: product.stock ?? 0,
        category: product.category || "",
        warrantyStatus: product.warrantyStatus || "",
        distributorID: product.distributorID || ""
      };
  
      console.log("Body being sent to backend:", payload);
      
      let backendSuccess = false;
      
      // Only try backend if not a guest user
      if (user.userType !== "guest") {
        try {
          // Try to add to cart using the backend
          const response = await fetch(`http://localhost:8080/customers/add-to-cart?email=${encodeURIComponent(user.email)}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            console.log("Error response:", errorText);
            throw new Error(`Failed to add to cart: ${response.status} - ${errorText}`);
          }
          
          backendSuccess = true;
          
          // Update local shopping_cart for regular users too
          if (!user.shopping_cart) {
            user.shopping_cart = {};
          }
          
          const productId = payload.product_id;
          user.shopping_cart[productId] = (user.shopping_cart[productId] || 0) + 1;
          
          // Save the updated user object
          localStorage.setItem('user', JSON.stringify(user));
        } catch (backendError) {
          console.error("Failed to add to cart on backend:", backendError);
          // For regular users, show an error but still try to update local cart
          if (!user.shopping_cart) {
            user.shopping_cart = {};
          }
          
          const productId = payload.product_id;
          user.shopping_cart[productId] = (user.shopping_cart[productId] || 0) + 1;
          
          // Save the updated user object
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        // For guest users, update localStorage
        // Get current shopping cart from user object
        const shopping_cart = user.shopping_cart || {};
        
        // Update the cart
        const productId = payload.product_id;
        shopping_cart[productId] = (shopping_cart[productId] || 0) + 1;
        
        // Update user object
        user.shopping_cart = shopping_cart;
        
        // Save back to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log("Updated local cart:", shopping_cart);
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
      
      // Trigger immediate refetch to ensure UI is in sync
      setRefetch(prev => !prev);
    } catch (err) {
      console.error("Error adding to cart:", err);
      // Don't throw the error anymore to prevent the UI from breaking
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
      console.log("User in deleteFromCart:", user);
      
      if (!user?.email) {
        console.error("User object missing email:", user);
        return;
      }
      
      let backendSuccess = false;
      
      // Only try backend if not a guest user
      if (user.userType !== "guest") {
        try {
          // Try to delete from cart using the backend
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
          
          if (!response.ok) {
            throw new Error(`Backend delete failed: ${response.status}`);
          }
          
          backendSuccess = true;
          
          // Also update local shopping_cart for regular users
          if (user.shopping_cart && user.shopping_cart[product.product_id]) {
            if (user.shopping_cart[product.product_id] <= 1) {
              delete user.shopping_cart[product.product_id];
            } else {
              user.shopping_cart[product.product_id] -= 1;
            }
            
            // Save the updated user object
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (backendError) {
          console.error("Failed to delete from cart on backend:", backendError);
          
          // For regular users, still try to update local cart
          if (user.shopping_cart && user.shopping_cart[product.product_id]) {
            if (user.shopping_cart[product.product_id] <= 1) {
              delete user.shopping_cart[product.product_id];
            } else {
              user.shopping_cart[product.product_id] -= 1;
            }
            
            // Save the updated user object
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      } else {
        // For guest users, update localStorage
        // Get current shopping cart from user object
        const shopping_cart = user.shopping_cart || {};
        
        // Update the cart
        const productId = product.product_id;
        if (shopping_cart[productId]) {
          if (shopping_cart[productId] <= 1) {
            delete shopping_cart[productId];
          } else {
            shopping_cart[productId] -= 1;
          }
        }
        
        // Update user object
        user.shopping_cart = shopping_cart;
        
        // Save back to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log("Updated local cart after delete:", shopping_cart);
      }
  
      // Update UI immediately
      setCartItems(prevItems =>
        prevItems
          .map(item =>
            item.product_id === product.product_id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter(item => item.quantity > 0)
      );
      
      // Trigger a refetch to ensure UI is in sync with backend/localStorage
      setRefetch(prev => !prev);
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
      console.log("Preparing checkout for user:", user);
  
      const shoppingCart = cartItems.reduce((acc, item) => {
        acc[item.product_id] = item.quantity;
        return acc;
      }, {});
  console.log("User in checkout-----------:", user);
  console.log("User id:", user.account_id||user.userId);
      // Prepare fake invoice to show in InvoicePage
      const fakeInvoice = {
        account_id: user.account_id||user.userId,
        name: user.username,
        surname: user.username,
        email: user.email,
        purchased: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          name: item.name,
          image: item.image,
          unit_price: item.unit_price|| item.unitPrice
        })),
        total_price: totalPrice,
        orderStatus: "pending",
        invoiceId: null,
        wishlist: user.wishlist || [] // Preserve the wishlist in the invoice data
      };
  
      console.log("Fake invoice prepared:", fakeInvoice);
  
      // Update user in localStorage to preserve wishlist
      const updatedUser = {
        ...user,
        wishlist: user.wishlist || []
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
  
      // Navigate to invoice page
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
