import React, { createContext, useContext, useState, useEffect } from "react";
import { normalizeProduct } from "./utils/normalizeProduct";
import { getCurrentUser } from "./global";
import { useNavigate } from "react-router-dom"; 

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);
export function MyComponent() {
  const { cartItems, totalPrice, addToCart } = useCart();

  return (
    <div>
      <div>Total: {totalPrice}</div>
      <button onClick={() => addToCart({ product_id: "1", name: "Test", unit_price: 100 })}>
        Add to Cart
      </button>
    </div>
  );
}


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

const userId = user.account_id ?? user.email;

if (!userId) {
  console.error("No user ID found in user object:", user);
  return;
}

const response = await fetch(`http://localhost:8080/customers/get-cart?customerID=${encodeURIComponent(userId)}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});

        if (!response.ok) {
          throw new Error(`Failed to fetch cart: ${response.status}`);
        }

        const cartMap = await response.json();
        console.log("Cart Map:", cartMap);

        if (!cartMap || typeof cartMap !== "object") {
          console.warn("Invalid cart data received");
          return;
        }

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

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.product_id === item.product_id);
      if (exists) {
        return prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      // Use item.quantity if provided, otherwise default to 1
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const deleteFromCart = (item) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
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
      
      // Prepare fake invoice to show in InvoicePage
      const fakeInvoice = {
        name: user.username,
        surname: user.username,
        email: user.email,
        purchased: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          name: item.name,
          image: item.image,
          unit_price: item.unit_price
        })),
        total_price: totalPrice,
        orderStatus: "pending",
        invoiceId: null
      };
  
      console.log("Fake invoice prepared:", fakeInvoice);
  
      // NO BACKEND CALL! just navigate
      navigate("/invoice", { state: { invoice: fakeInvoice } });
    } catch (err) {
      console.error("Error preparing checkout:", err);
    }
  };
  
  

  const totalPrice = Number(
    Array.isArray(cartItems)
      ? cartItems.reduce(
          (sum, item) =>
            sum +
            (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
          0
        )
      : 0
  ) || 0;

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
