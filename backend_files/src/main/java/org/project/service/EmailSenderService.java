package org.project.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@Service
public class EmailSenderService {
    @Autowired
    private JavaMailSender mailSender;

    public ResponseEntity<String> sendEmail(String toEmail, MultipartFile file) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        try {
            helper.setFrom("308projectinvoice@gmail.com");
            helper.setTo(toEmail);
            helper.setText("Below is the invoice receipt for your checkout.");
            helper.setSubject("Checkout Invoice");

            helper.addAttachment("invoice.pdf", new ByteArrayResource(file.getBytes()));

            mailSender.send(message);
            return ResponseEntity.ok("Invoice sent successfully.");
        }
        catch (Exception e){
            return ResponseEntity.status(500).body("Failed to send invoice.");
        }
    }
}
/*
public ResponseEntity<String> sendEmail(String toEmail, MultipartFile file, String type, String productID, double new_price) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        try {
            helper.setFrom("308projectinvoice@gmail.com");
            helper.setTo(toEmail);
            
            switch (type){
                case "invoice":
                    if (file == null){
                        throw new IllegalArgumentException();
                    }
                    helper.setText("Below is the invoice receipt for your checkout.");
                    helper.setSubject("Checkout Invoice");
                    helper.addAttachment("invoice.pdf", new ByteArrayResource(file.getBytes()));

                case "sale_alert":
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    PdfWriter writer = new PdfWriter(baos);
                    PdfDocument pdf = new PdfDocument(writer);
                    Document document = new Document(pdf);

                    document.add(new Paragraph("Sale Notification"));
                    document.add(new Paragraph("Product ID: " + productID));
                    document.add(new Paragraph("New Price: $" + new_price));
                    document.add(new Paragraph("Hurry up! This is a limited-time offer."));

                    document.close();

                    helper.setText("Below is the sale notification for your wishlist item.");
                    helper.setSubject("Sale Notification");
                    helper.addAttachment("sale_notification.pdf", new ByteArrayResource(baos.toByteArray()));

                case "refund":
                    ByteArrayOutputStream refund_baos = new ByteArrayOutputStream();
                    PdfWriter refund_writer = new PdfWriter(refund_baos);
                    PdfDocument refund_pdf = new PdfDocument(refund_writer);
                    Document refund_document = new Document(refund_pdf);

                    refund_document.add(new Paragraph("Refund Receipt")); 
                    refund_document.add(new Paragraph("Product ID: " + productID));
                    refund_document.add(new Paragraph("Refund Amount: " + new_price));
                    refund_document.add(new Paragraph("Your refund request has been accepted."));
                    
                    helper.setText("Below is the refund receipt for the products you have returned.");
                    helper.setSubject("Refund Notification");
                    helper.addAttachment("refund_receipt.pdf", new ByteArrayResource(refund_baos.toByteArray()));
                
                case "no-refund":
                ByteArrayOutputStream no_refund_baos = new ByteArrayOutputStream();
                PdfWriter no_refund_writer = new PdfWriter(no_refund_baos);
                PdfDocument no_refund_pdf = new PdfDocument(no_refund_writer);
                Document no_refund_document = new Document(no_refund_pdf);

                no_refund_document.add(new Paragraph("Refund Rejected")); 
                no_refund_document.add(new Paragraph("Product ID: " + productID));
                no_refund_document.add(new Paragraph("Refund Amount: " + new_price));
                no_refund_document.add(new Paragraph("Your refund request for this product has been rejected."));
                
                helper.setText("Below is the status report for your refund.");
                helper.setSubject("Refund Notification");
                helper.addAttachment("refund_rejection.pdf", new ByteArrayResource(no_refund_baos.toByteArray()));
            }
            
            mailSender.send(message);
            return ResponseEntity.ok(type.equals("invoice") ? "Invoice sent successfully." : "Notification sent successfully.");
        }
        catch (Exception e){
            return ResponseEntity.status(500).body("Failed to send " + (type.equals("invoice") ? "invoice" : "notification") + ".");
        }
    } */



