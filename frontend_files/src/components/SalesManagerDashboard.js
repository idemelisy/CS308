import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SalesManagerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState({});
  const navigate = useNavigate();

  // Ürünleri backend'den fetch et
  useEffect(() => {
    fetch("http://localhost:8080/products/all")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // İndirim uygulama fonksiyonu
  const applyDiscount = (product) => {
    const discount = discounts[product.product_id];
    if (!discount || isNaN(discount) || discount <= 0 || discount > 100) {
      alert("Please enter a valid discount percentage (1-100).");
      return;
    }

    const discountedPrice = product.unitPrice - (product.unitPrice * discount) / 100;

  // Backend'e indirimli fiyatı gönder
    fetch(`http://localhost:8080/sales-managers/declare-sale?new_price=${discountedPrice}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to apply discount");
        return response.json();
      })
      .then((updatedProduct) => {
        alert(
          `Discount applied! New price for ${updatedProduct.name}: $${updatedProduct.unitPrice.toFixed(2)}`
        );
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.product_id === updatedProduct.product_id
              ? { ...p, unitPrice: updatedProduct.unitPrice }
              : p
          )
        );
      })
      .catch((error) => {
        alert("Discount could not be applied.");
        console.error(error);
      });
  };

  return (
    <div>
      <h1>Sales Manager Dashboard</h1>
      <button onClick={() => navigate("/sales-managers/invoices")}>Invoices</button>
      <h2>Product Discounts</h2>
      <ul>
        {products.map((product) => (
          <li key={product.product_id}>
            <strong>{product.name}</strong> - ${product.unitPrice.toFixed(2)}
            <input
              type="number"
              placeholder="Discount %"
              onChange={(e) =>
                setDiscounts({
                  ...discounts,
                  [product.product_id]: e.target.value,
                })
              }
            />
            <button onClick={() => applyDiscount(product)}>Apply Discount</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SalesManagerDashboard;