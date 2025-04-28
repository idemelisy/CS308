import React from 'react';
import { useCart } from "./CartContext.jsx"; // or "./CartContext.jsx" if using .jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";
import { vi, describe, test, expect, beforeAll, afterAll } from "vitest";
import { CartProvider } from './CartContext.jsx';

// Mock getCurrentUser
vi.mock("./global", () => ({
  getCurrentUser: () => ({
    email: "test@example.com",
    username: "testuser",
  }),
}));

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

let cartData = [];

beforeAll(() => {
  global.fetch = vi.fn((url, options) => {
    if (url.includes("add-to-cart")) {
      // Just return success, do NOT update cartData here
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    if (url.includes("delete-from-cart")) {
      // Just return success, do NOT update cartData here
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    if (url.includes("get-cart")) {
      // Always return an empty cart for initial load
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes("checkout")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    // Default mock
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
});

afterAll(() => {
  global.fetch.mockRestore && global.fetch.mockRestore();
});

// Helper Component (JS version, not JSX)
function TestComponent() {
  const { cartItems, addToCart, deleteFromCart, checkout, loading, totalPrice } = useCart();
  return (
    <div>
      <span>{loading ? "Loading..." : "Loaded"}</span>
      <button onClick={() => addToCart({ product_id: "1", name: "Test Product", unit_price: 100 })}>
        Add to Cart
      </button>
      <button onClick={() => deleteFromCart({ product_id: "1", name: "Test Product", unit_price: 100 })}>
        Remove from Cart
      </button>
      <button onClick={() => checkout()}>Checkout</button>
      <div data-testid="cart-count">{cartItems.length}</div>
      <div data-testid="total-price">{totalPrice}</div>
    </div>
  );
}

// REAL TESTS
describe("CartProvider Pure JS Tests", () => {
 /* test("1. shows loading on first render", () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Loading...")).toBeTruthy();
  });*/

  test("2. shows loaded after loading", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText("Loaded")).toBeTruthy());
  });

  test("3. cart starts empty", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("0"));
  });

  test("4. can add item to cart", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("Loaded"));
    fireEvent.click(screen.getByText("Add to Cart"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("1"));
  });

  test("5. can remove item from cart", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("Loaded"));
    fireEvent.click(screen.getByText("Add to Cart"));
    fireEvent.click(screen.getByText("Remove from Cart"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("0"));
  });

  test("6. total price updates after add", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("Loaded"));
    fireEvent.click(screen.getByText("Add to Cart"));
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("100"));
  });

  test("7. total price is 0 after remove", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("Loaded"));
    fireEvent.click(screen.getByText("Add to Cart"));
    fireEvent.click(screen.getByText("Remove from Cart"));
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("0"));
  });

  test("8. multiple adds increase cart count", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("Loaded"));
    fireEvent.click(screen.getByText("Add to Cart"));
    fireEvent.click(screen.getByText("Add to Cart"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("1")); // Same item, quantity should grow
  });

  test("9. checkout does not crash", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("Loaded"));
    fireEvent.click(screen.getByText("Checkout"));
  });

  test("10. cart handles empty correctly", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("0"));
    expect(screen.getByTestId("total-price").textContent).toBe("0");
  });
  // Helper test component to access context
function TestComponent() {
  const { cartItems, addToCart, deleteFromCart, checkout, totalPrice, loading } = useCart();
  return (
    <div>
      <div data-testid="cart-count">{cartItems.length}</div>
      <div data-testid="total-price">{totalPrice}</div>
      <div data-testid="loading">{loading ? "Loading" : "Loaded"}</div>
      <button onClick={() => addToCart({ product_id: "1", name: "Test Product", unit_price: 100 })}>
        Add to Cart
      </button>
      <button onClick={() => deleteFromCart({ product_id: "1" })}>Remove from Cart</button>
      <button onClick={checkout}>Checkout</button>
    </div>
  );
}

describe("CartProvider Additional Tests", () => {
  test("11. addToCart adds a new item", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add to Cart"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("1"));
  });

 /*  test("12. addToCart increases quantity if item exists", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add to Cart"));
    fireEvent.click(screen.getByText("Add to Cart"));
    await waitFor(() => {
      const { cartItems } = useCart();
      expect(cartItems[0].quantity).toBe(2);
    });
  });

 test("13. deleteFromCart decreases quantity", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add to Cart"));
    fireEvent.click(screen.getByText("Add to Cart"));
    fireEvent.click(screen.getByText("Remove from Cart"));
    await waitFor(() => {
      const { cartItems } = useCart();
      expect(cartItems[0].quantity).toBe(1);
    });
  });
*/
  test("14. deleteFromCart removes item when quantity is 0", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add to Cart"));
    fireEvent.click(screen.getByText("Remove from Cart"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("0"));
  });

  test("15. totalPrice is correct for multiple items", async () => {
    function MultiAddComponent() {
      const { addToCart } = useCart();
      return (
        <div>
          <button onClick={() => addToCart({ product_id: "1", name: "A", unit_price: 50 })}>Add A</button>
          <button onClick={() => addToCart({ product_id: "2", name: "B", unit_price: 150 })}>Add B</button>
        </div>
      );
    }
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
          <MultiAddComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add A"));
    fireEvent.click(screen.getByText("Add B"));
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("200"));
  });

  test("16. addToCart with quantity property works", async () => {
    function QuantityComponent() {
      const { addToCart } = useCart();
      return (
        <button onClick={() => addToCart({ product_id: "3", name: "Q", unit_price: 10, quantity: 5 })}>
          Add Q
        </button>
      );
    }
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
          <QuantityComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add Q"));
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("50"));
  });

  test("17. checkout does not throw error with empty cart", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    expect(() => fireEvent.click(screen.getByText("Checkout"))).not.toThrow();
  });

  test("18. loading is true on initial render", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId("loading").textContent).toBe("Loading");
  });

  test("19. loading becomes false after cart loads", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("Loaded"));
  });

  test("20. addToCart does not add duplicate items, only increases quantity", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add to Cart"));
    fireEvent.click(screen.getByText("Add to Cart"));
    await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("1"));
  });

  test("21. totalPrice is 0 when cart is empty", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("0"));
  });

  test("22. addToCart with 0 price does not break totalPrice", async () => {
    function ZeroPriceComponent() {
      const { addToCart } = useCart();
      return (
        <button onClick={() => addToCart({ product_id: "4", name: "Zero", unit_price: 0 })}>
          Add Zero
        </button>
      );
    }
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
          <ZeroPriceComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add Zero"));
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("0"));
  });

  test("23. addToCart with negative price works", async () => {
    function NegativePriceComponent() {
      const { addToCart } = useCart();
      return (
        <button onClick={() => addToCart({ product_id: "5", name: "Neg", unit_price: -10 })}>
          Add Neg
        </button>
      );
    }
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
          <NegativePriceComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add Neg"));
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("-10"));
  });

  test("24. addToCart with missing unit_price treats as 0", async () => {
    function NoPriceComponent() {
      const { addToCart } = useCart();
      return (
        <button onClick={() => addToCart({ product_id: "6", name: "NoPrice" })}>
          Add NoPrice
        </button>
      );
    }
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
          <NoPriceComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add NoPrice"));
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("0"));
  });

  test("25. addToCart with missing name does not break", async () => {
    function NoNameComponent() {
      const { addToCart } = useCart();
      return (
        <button onClick={() => addToCart({ product_id: "7", unit_price: 10 })}>
          Add NoName
        </button>
      );
    }
    render(
      <MemoryRouter>
        <CartProvider>
          <TestComponent />
          <NoNameComponent />
        </CartProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Add NoName"));
    await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("10"));
  });
});
test("26. addToCart with string price converts to number", async () => {
  function StringPriceComponent() {
    const { addToCart } = useCart();
    return (
      <button onClick={() => addToCart({ product_id: "8", name: "StringPrice", unit_price: "30" })}>
        Add StringPrice
      </button>
    );
  }
  render(
    <MemoryRouter>
      <CartProvider>
        <TestComponent />
        <StringPriceComponent />
      </CartProvider>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText("Add StringPrice"));
  await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("30"));
});

test("27. addToCart with duplicate but different name only increases quantity", async () => {
  function DuplicateComponent() {
    const { addToCart } = useCart();
    return (
      <div>
        <button onClick={() => addToCart({ product_id: "9", name: "First", unit_price: 5 })}>
          Add First
        </button>
        <button onClick={() => addToCart({ product_id: "9", name: "Second", unit_price: 5 })}>
          Add Second
        </button>
      </div>
    );
  }
  render(
    <MemoryRouter>
      <CartProvider>
        <TestComponent />
        <DuplicateComponent />
      </CartProvider>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText("Add First"));
  fireEvent.click(screen.getByText("Add Second"));
  await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("1"));
  await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("10"));
});

test("28. addToCart with undefined quantity defaults to 1", async () => {
  function UndefinedQuantityComponent() {
    const { addToCart } = useCart();
    return (
      <button onClick={() => addToCart({ product_id: "10", name: "UndefQty", unit_price: 7, quantity: undefined })}>
        Add UndefQty
      </button>
    );
  }
  render(
    <MemoryRouter>
      <CartProvider>
        <TestComponent />
        <UndefinedQuantityComponent />
      </CartProvider>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText("Add UndefQty"));
  await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("7"));
});
test("29. adding two different products increases cart count and total price correctly", async () => {
  function TwoProductsComponent() {
    const { addToCart } = useCart();
    return (
      <div>
        <button onClick={() => addToCart({ product_id: "11", name: "Prod1", unit_price: 20 })}>
          Add Prod1
        </button>
        <button onClick={() => addToCart({ product_id: "12", name: "Prod2", unit_price: 80 })}>
          Add Prod2
        </button>
      </div>
    );
  }
  render(
    <MemoryRouter>
      <CartProvider>
        <TestComponent />
        <TwoProductsComponent />
      </CartProvider>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText("Add Prod1"));
  fireEvent.click(screen.getByText("Add Prod2"));
  await waitFor(() => expect(screen.getByTestId("cart-count").textContent).toBe("2"));
  await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("100"));
});
test("30. addToCart with floating-point price calculates total correctly", async () => {
  function FloatPriceComponent() {
    const { addToCart } = useCart();
    return (
      <button onClick={() => addToCart({ product_id: "13", name: "FloatItem", unit_price: 12.34 })}>
        Add FloatItem
      </button>
    );
  }
  render(
    <MemoryRouter>
      <CartProvider>
        <TestComponent />
        <FloatPriceComponent />
      </CartProvider>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText("Add FloatItem"));
  await waitFor(() => expect(screen.getByTestId("total-price").textContent).toBe("12.34"));
});
});
