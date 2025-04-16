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
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const rawUser = getCurrentUser();
        console.log("Raw User:", rawUser);
        if (!rawUser) {
          console.warn("No user is logged in.");
          return;
        }
  
        const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
        console.log("User:", user);
        const customerID = user.account_id || user.id; // pick whichever field your backend expects
        if (!customerID) {
          console.error("No customer ID found.");
          return;
        }
  
        const response = await fetch(`http://localhost:8080/customers/get-cart?customerID=${customerID}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = await response.json();
      console.log("Response Data:", responseData);
      if (!response.ok|| !responseData || typeof responseData !="object") {
        console.error("Failed to fetch cart:", response.status);
        return;
      }
      const cartMap = responseData;
        
        console.log("Cart Map:", cartMap);
        const productIds = Object.keys(cartMap);
  
        const productPromises = productIds.map(async (product_id) => {
          const res = await fetch(`http://localhost:8080/products/${product_id}`);
          const product = await res.json();
  
          return {
            product_id,
            quantity: cartMap[product_id],
            name: product.name,
            image: product.image,
            unit_price: product.price,
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
       // Log the user to see its contents before updating
    console.log("User before update:", user);

    // Update the shopping_cart object with the current cartItems
    const shoppingCart = cartItems.reduce((acc, item) => {
      acc[item.product_id] = item.quantity;  // Ensure product_id is the key and quantity is the value
      return acc;
    }, {});

    // Update the user object to include the correct shopping_cart format
    user.shopping_cart = shoppingCart;

    // Log the updated user with the shopping_cart
    console.log("Updated User with Shopping Cart:", user);
      console.log("🛒 Cart Items at checkout:", cartItems);

      const response = await fetch("http://localhost:8080/customers/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        console.error("Failed to checkout");
        return;
      }
      const invoice = await response.json();
      
      console.log("Invoice received from backend:", invoice);
      console.log("Checkout response:", invoice);
      setInvoice(invoice);
      setCartItems([]); // Clear cart on success
     
      navigate("/invoice", { state: { invoice } });
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
