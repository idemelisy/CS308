import React from "react";
import { jsPDF } from "jspdf";

const DownloadPdfButton = ({ items }) => {
  const generatePdf = () => {
    const doc = new jsPDF();
    doc.text("Invoice Summary", 10, 10);

    items.forEach((item, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${item}`, 10, 20 + index * 10);
    });

    doc.save("invoice.pdf");
  };

  return (
    <button onClick={generatePdf}>
      Download PDF
    </button>
  );
};

export default DownloadPdfButton;
