import { useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { useState } from "react";

function InvoicePage() {
  const location = useLocation();
  const { invoice } = location.state || {};
  const [email, setEmail] = useState("");

  if (!invoice || !Array.isArray(invoice.purchased) || invoice.purchased.length === 0) {
    return <p>No items were purchased. Invoice is empty.</p>;
  }

  const downloadPdf = () => {
    const element = document.getElementById("invoice-section");
    html2pdf().from(element).save();
  };

  const sendEmail = async () => {
    const element = document.getElementById("invoice-section");
    const opt = { filename: "invoice.pdf" };
    const worker = html2pdf().from(element).set(opt);
    const blob = await worker.outputPdf("blob");

    const formData = new FormData();
    formData.append("toEmail", email);
    formData.append("file", blob, "invoice.pdf");

    await fetch("/send-invoice", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div>
      <div id="invoice-section">
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

      <br />
      <input
        type="email"
        placeholder="Recipient Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <button onClick={downloadPdf}>Download PDF</button>
      <button onClick={sendEmail}>Send via Email</button>
    </div>
  );
}

export default InvoicePage;
