import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { useState } from "react";
import { getCurrentUser } from "./global"; // make sure you import this

function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
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
    try {
      const element = document.getElementById("invoice-section");
      const opt = { filename: "invoice.pdf" };
      const worker = html2pdf().from(element).set(opt);
      const blob = await worker.outputPdf("blob");

      const formData = new FormData();
      formData.append("toEmail", email);
      formData.append("file", new File([blob], "invoice.pdf", { type: "application/pdf" }));

      const response = await fetch("http://localhost:8080/customers/send-invoice", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Invoice sent successfully!");
      } else {
        console.error("Failed to send invoice. Status:", response.status);
      }
    } catch (error) {
      console.error("Error during sendEmail:", error);
    }
  };

  const finishCheckout = async () => {
    try {
      const rawUser = getCurrentUser();
      if (!rawUser) {
        console.error("No logged-in user.");
        return;
      }
  
      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      console.log("Current user at finish checkout:", user);
  
      // First, fetch the current wishlist from the backend
      const wishlistResponse = await fetch(`http://localhost:8080/customers/get-wishlist?customerID=${user.account_id}`);
      const currentWishlist = await wishlistResponse.json();
      
      const shoppingCart = invoice.purchased.reduce((acc, item) => {
        acc[item.product_id] = item.quantity;
        return acc;
      }, {});
  
      // This payload matches your backend format
      const payload = {
        account_id: user.account_id,
        shopping_cart: shoppingCart,
        name: user.username,
        surname: user.username,
        email: user.email,
        password: "1", // if backend needs it
        wishlist: currentWishlist.map(product => product.product_id) // Use the backend wishlist data
      };
  
      console.log("Payload being sent to backend:", payload);
  
      const response = await fetch("http://localhost:8080/customers/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        console.error("Failed to finish checkout", await response.text());
        return;
      }
  
      const updatedInvoice = await response.json();
      console.log("Checked out successfully:", updatedInvoice);
  
      // Update local storage with the backend wishlist data
      const updatedUser = {
        ...user,
        shopping_cart: {},
        wishlist: currentWishlist.map(product => product.product_id)
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
  
      alert("Checkout completed successfully!");
      navigate("/home");
    } catch (err) {
      console.error("Error finishing checkout:", err);
    }
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
      <br /><br />
      
      {/* ✅ New button to actually trigger checkout */}
      <button onClick={finishCheckout}>Finish Checking Out</button>
    </div>
  );
}

export default InvoicePage;
