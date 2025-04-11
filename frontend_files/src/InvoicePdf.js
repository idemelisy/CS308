import React from "react";
import { jspdf } from "jspdf";

const DownloadPdfButton = ( {items} ) => {
    const generatePdf = () => {
        const doc = new jspdf();

        doc.text("Hello world!", 10, 10);

        items.forEach((item, index) => {
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${item}`, 10, 20 + index * 10);
          });

        doc.save("invoice.pdf");     
    };

    return (
        <button onClick={generatePdf}>
            Download pdf
        </button>
    );
};  

export default DownloadPdfButton;