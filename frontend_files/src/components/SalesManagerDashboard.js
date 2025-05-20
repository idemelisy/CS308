import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SalesManagerDashboard.css"; // Style dosyası varsa buraya ekle

const SalesManagerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState({});
  const [priceInputs, setPriceInputs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/products/all")
      .then((res) => res.json())
      .then((data) => setProducts(data.filter(p => Number(p.unitPrice) >= 0)))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handlePriceChange = (productId, value) => {
    setPriceInputs(prev => ({ ...prev, [productId]: value }));
  };

  const handleDiscountChange = (productId, value) => {
    setDiscounts(prev => ({ ...prev, [productId]: value }));
  };

  const handleSetPrice = async (product) => {
    const newPrice = priceInputs[product.product_id];
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/sales-managers/set-price?price=${newPrice}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.product_id === updated.product_id ? updated : p));
      alert(`Price updated to $${updated.unitPrice.toFixed(2)}`);
    } catch (err) {
      console.error("Error setting price:", err);
    }
  };

  const applyDiscount = async (product) => {
    const discount = discounts[product.product_id];
    if (!discount || isNaN(discount) || discount <= 0 || discount > 100) {
      alert("Enter valid discount (1-100).");
      return;
    }

    const discountedPrice = product.unitPrice - (product.unitPrice * discount) / 100;

    try {
      const res = await fetch(`http://localhost:8080/sales-managers/declare-sale?new_price=${discountedPrice}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.product_id === updated.product_id ? updated : p));
      alert(`New discounted price: $${updated.unitPrice.toFixed(2)}`);
    } catch (err) {
      console.error("Discount error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Sales Manager Dashboard</h1>
      <div className="nav-buttons">
        <button onClick={() => navigate("/sales-managers/invoices")}>Invoices</button>
        <button onClick={() => navigate("/sales-managers/refunds")}>Refunds</button>
      </div>

      <div className="product-cards">
        {products.map(product => (
          <div className="product-card" key={product.product_id}>
            <h3>{product.name}</h3>
            <p><strong>Current Price:</strong> ${Number(product.unitPrice).toFixed(2)}</p>

            <input
              type="number"
              placeholder="New Price"
              value={priceInputs[product.product_id] || ""}
              onChange={(e) => handlePriceChange(product.product_id, e.target.value)}
            />
            <button className="set-btn" onClick={() => handleSetPrice(product)}>Set Price</button>

            <input
              type="number"
              placeholder="Discount %"
              value={discounts[product.product_id] || ""}
              onChange={(e) => handleDiscountChange(product.product_id, e.target.value)}
            />
            <button className="discount-btn" onClick={() => applyDiscount(product)}>Apply Discount</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesManagerDashboard;
