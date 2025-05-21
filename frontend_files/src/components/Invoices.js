import React, { useState } from "react";

const Invoices = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoices, setInvoices] = useState([]);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const formattedStart = `${startDate}T00:00:00Z`;
    const formattedEnd = `${endDate}T23:59:59Z`;

    try {
      const response = await fetch(
        `http://localhost:8080/sales-managers/range-invoices?start_date=${formattedStart}&end_date=${formattedEnd}`
      );
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      console.error("❌ Error fetching invoices:", err);
      alert("Failed to fetch invoices. See console for details.");
    }
  };

  const handleDownloadPdf = async (invoice) => {
    const invoiceId = invoice._id || invoice.invoiceId;
    if (!invoiceId) {
      alert("Invoice ID not found.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/sales-managers/download-invoice?invoice_id=${invoiceId}`);
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Error downloading PDF:", err);
      alert("Failed to download PDF. See console for details.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "#ff6600" }}>Invoices</h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>{" "}
        <label>
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>{" "}
        <button
          style={{
            backgroundColor: "#ff912b",
            color: "white",
            padding: "0.5rem 1rem",
          }}
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <h2>Invoice List</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {invoices.length > 0 ? (
          invoices.map((invoice, i) => (
            <li
              key={invoice._id || i}
              id={`invoice-${invoice._id}`}
              style={{
                marginBottom: "2rem",
                background: "#fff5e6",
                borderRadius: "8px",
                padding: "1rem",
                boxShadow: "0 0 10px rgba(0,0,0,0.05)",
              }}
            >
              <p><strong>Invoice ID:</strong> {invoice.invoiceId || "N/A"}</p>
              <p><strong>Date:</strong> {invoice.date?.split("T")[0]}</p>
              <p><strong>Products:</strong></p>
              <ul>
                {invoice.purchased &&
                  Object.entries(invoice.purchased).map(([productId, quantity]) => (
                    <li key={productId}>
                      <strong>{productId}</strong>: {quantity}
                    </li>
                  ))}
              </ul>
              <p><strong>Total:</strong> ${invoice.total_price?.toFixed(2)}</p>
              <p><strong>Status:</strong> {invoice.orderStatus || "Pending"}</p>
              <p><strong>Delivery Address:</strong> {invoice.address || "N/A"}</p>
              <p><strong>Customer Name:</strong> {invoice.purchaser?.name || invoice.purchaser?.email || "Unknown"}</p>
              <button
                style={{ backgroundColor: "#ff912b", color: "white" }}
                onClick={() => handleDownloadPdf(invoice)}
              >
                Download PDF
              </button>
            </li>
          ))
        ) : (
          <p style={{ color: "#666" }}>No invoices found in this date range.</p>
        )}
      </ul>
    </div>
  );
};

export default Invoices;
