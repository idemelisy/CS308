import { useLocation } from "react-router-dom";

function InvoicePage() {
  const location = useLocation();
  const { invoice } = location.state || {};

  if (!invoice || !Array.isArray(invoice.purchased) || invoice.purchased.length === 0) {
    return <p>No items were purchased. Invoice is empty.</p>;
  }

  return (
    <div>
      <h2>Invoice #{invoice.invoiceId || "N/A"}</h2>
      <p>
        Purchaser: {invoice.name || "Unknown"} {invoice.surname || ""}
      </p>
      <p>Total: ${invoice.total_price?.toFixed(2) || "0.00"}</p>

      <h3>Items:</h3>
      <ul>
        {invoice.purchased.map((item, index) => (
          <li key={index}>
            <p>Product Name: {item.name || "Unknown"}</p>
            <p>Product ID: {item.product_id || "N/A"}</p>
            <p>Quantity: {item.quantity || 0}</p>
            <p>Unit Price: ${item.unit_price ? item.unit_price.toFixed(2) : "0.00"}</p>
            <img src={item.image || "/placeholder.jpg"} alt={item.name || "Product"} width="60" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InvoicePage;
