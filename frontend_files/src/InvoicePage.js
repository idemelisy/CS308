import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { useState } from "react";
import { getCurrentUser } from "./global"; // make sure you import this
import "./InvoicePage.css";
import { FaDownload, FaEnvelope, FaCheck } from "react-icons/fa";

function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoice } = location.state || {};
  const [email, setEmail] = useState("");

  if (!invoice || !Array.isArray(invoice.purchased) || invoice.purchased.length === 0) {
    return (
      <div className="invoice-container">
        <h2>Error</h2>
        <p>No items were purchased. Invoice is empty.</p>
        <button className="action-button" onClick={() => navigate("/home")}>Return to Home</button>
      </div>
    );
  }

  const downloadPdf = () => {
    const element = document.getElementById("invoice-section");
    html2pdf().from(element).save();
  };

  const sendEmail = async () => {
    if (!email.trim()) {
      alert("Please enter an email address");
      return;
    }
    
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
        alert("Invoice sent successfully!");
      } else {
        alert("Failed to send invoice. Please try again.");
        console.error("Failed to send invoice. Status:", response.status);
      }
    } catch (error) {
      console.error("Error during sendEmail:", error);
      alert("An error occurred while sending the email. Please try again.");
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
      
      if (!wishlistResponse.ok) {
        console.error("Failed to fetch wishlist:", await wishlistResponse.text());
      }
      
      let currentWishlist = [];
      try {
        const wishlistData = await wishlistResponse.json();
        currentWishlist = Array.isArray(wishlistData) ? wishlistData : [];
      } catch (error) {
        console.error("Error parsing wishlist response:", error);
      }
      
      console.log("Current wishlist:", currentWishlist);
      
      const shoppingCart = invoice.purchased.reduce((acc, item) => {
        acc[item.product_id] = item.quantity;
        return acc;
      }, {});
  
      // This payload matches your backend format
      const payload = {
        account_id: user.account_id || user.userId,
        name: user.name||user.username,
        surname: user.surname,
        shopping_cart: shoppingCart,
        email: user.email,
        password: "1", // if backend needs it
        wishlist: Array.isArray(currentWishlist) ? currentWishlist.map(product => product.product_id) : []
      };
  
      console.log("Payload being sent to backend:", payload);
  
      const response = await fetch(`http://localhost:8080/customers/checkout?address=${encodeURIComponent(invoice.delivery_address)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        console.error("Failed to finish checkout", await response.text());
        alert("Failed to complete checkout. Please try again.");
        return;
      }
  
      const updatedInvoice = await response.json();
      console.log("Checked out successfully:", updatedInvoice);
  
      // Update local storage with the backend wishlist data
      const updatedUser = {
        ...user,
        shopping_cart: {},
        wishlist: Array.isArray(currentWishlist) ? currentWishlist.map(product => product.product_id) : []
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
  
      alert("Checkout completed successfully!");
      navigate("/home");
    } catch (err) {
      console.error("Error finishing checkout:", err);
      alert("An error occurred while completing checkout. Please try again.");
    }
  };
  

  return (
    <div className="invoice-container">
      <div id="invoice-section">
        <div className="invoice-header">
          <h2>Invoice</h2>
          <div className="invoice-id">
            #{invoice.invoiceId || "Pending"}
          </div>
        </div>
        
        <div className="invoice-details">
          <div className="purchaser-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> {invoice.name || "Unknown"} {invoice.surname || ""}</p>
            <p><strong>Email:</strong> {invoice.email || "N/A"}</p>
            <p><strong>Status:</strong> {invoice.orderStatus || "Pending"}</p>
            <p><strong>Delivery Address:</strong> {invoice.delivery_address || "Not Provided"}</p>
          </div>
          
          <div className="order-summary">
            <h3>Order Summary</h3>
            <p><strong>Items:</strong> {invoice.purchased.length}</p>
            <p><strong>Total Quantity:</strong> {invoice.purchased.reduce((sum, item) => sum + (item.quantity || 0), 0)}</p>
            <p className="total"><strong>Total:</strong> ${invoice.total_price?.toFixed(2) || "0.00"}</p>
          </div>
        </div>

        <div className="items-list">
          <h3>Purchased Items</h3>
          <ul className="items-container">
            {invoice.purchased.map((item, index) => (
              <li key={index} className="invoice-item">
                <img src={item.image || "/placeholder.jpg"} alt={item.name || "Product"} />
                <h4 className="item-name">{item.name || "Unknown Product"}</h4>
                <p className="product-id"><strong>Product ID:</strong> {item.product_id || "N/A"}</p>
                <p><strong>Quantity:</strong> {item.quantity || 0}</p>
                <p className="price"><strong>Unit Price:</strong> ${item.unit_price ? item.unit_price.toFixed(2) : "0.00"}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="invoice-actions">
        <div className="email-input-container">
          <input
            type="email"
            placeholder="Enter email to receive invoice"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="button-group">
          <button className="action-button" onClick={downloadPdf}>
            <FaDownload /> Download PDF
          </button>
          <button className="action-button secondary" onClick={sendEmail}>
            <FaEnvelope /> Send via Email
          </button>
        </div>
        
        <button className="finish-button" onClick={finishCheckout}>
          <FaCheck /> Complete Checkout
        </button>
      </div>
    </div>
  );
}

export default InvoicePage;
