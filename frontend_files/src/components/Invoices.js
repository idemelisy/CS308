import React, { useState } from "react";

const Invoices = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoices, setInvoices] = useState([]);

  // Simüle edilmiş invoice verileri
  const mockInvoices = [
    { id: "1", date: "2025-05-10", total: 500.0, customer: "John Doe" },
    { id: "2", date: "2025-05-11", total: 300.0, customer: "Jane Smith" },
    { id: "3", date: "2025-05-12", total: 700.0, customer: "Alice Johnson" },
  ];

  const handleSearch = () => {
    // Şimdilik sadece mock verileri filtreliyoruz
    const filteredInvoices = mockInvoices.filter(
      (invoice) =>
        (!startDate || invoice.date >= startDate) &&
        (!endDate || invoice.date <= endDate)
    );
    setInvoices(filteredInvoices);
  };

  const handleDownloadPdf = (invoice) => {
    alert(`Downloading PDF for Invoice ID: ${invoice.id}`);
    // PDF indirme işlemi backend hazır olduğunda entegre edilecek
  };

  return (
    <div>
      <h1>Invoices</h1>
      <div>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={handleSearch}>Search</button>
      </div>
      <h2>Invoice List</h2>
      <ul>
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <p><strong>ID:</strong> {invoice.id}</p>
            <p><strong>Date:</strong> {invoice.date}</p>
            <p><strong>Total:</strong> ${invoice.total.toFixed(2)}</p>
            <p><strong>Customer:</strong> {invoice.customer}</p>
            <button onClick={() => handleDownloadPdf(invoice)}>Download PDF</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Invoices;