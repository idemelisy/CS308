import { useLocation } from "react-router-dom";

function InvoicePage() {
  const location = useLocation();
  const { invoice } = location.state || {};

  if (!invoice || Object.keys(invoice.purchased).length === 0) {
    return <p>No items were purchased. Invoice is empty.</p>;
  }

  return (
    <div>
      <h2>Invoice #{invoice.invoiceId}</h2>
      <p>
        Purchaser: {invoice.name} {invoice.surname}
      </p>
      <p>Total: ${invoice.total_price.toFixed(2)}</p>

      <h3>Items:</h3>
      <ul>
        {Object.entries(invoice.purchased).map(([productId, qty]) => (
          <li key={productId}>
            Product ID: {productId}, Quantity: {qty}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InvoicePage;
