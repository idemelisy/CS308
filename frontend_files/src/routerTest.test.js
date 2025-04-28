import React from "react";
import { render, screen } from "@testing-library/react";
import { CartProvider } from "./CartContext";
import { BrowserRouter } from "react-router-dom";

describe("CartContext", () => {
  it("renders children", () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <div>Test</div>
        </CartProvider>
      </BrowserRouter>
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});