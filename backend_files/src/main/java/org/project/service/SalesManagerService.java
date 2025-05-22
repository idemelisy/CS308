package org.project.service;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.project.model.Customer;
import org.project.model.Invoice;
import org.project.model.Refund;
import org.project.model.product_model.Product;
import org.project.repository.ProductRepository;
import org.project.repository.RefundRepository;
import org.project.repository.ShoppingHistory;
import org.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;



@Service
public class SalesManagerService {

    @Autowired
    private UserRepository user_repo;

    @Autowired
    private ProductRepository product_repo;

    @Autowired 
    private EmailSenderService email_sender;

    @Autowired
    private RefundRepository refund_repo;

    @Autowired
    private ShoppingHistory invoice_repo;


    public Product declare_sale(Product product, double new_price) throws Exception{
        product.setUnitPrice(new_price);

        List<Customer> all_customers = user_repo.findAllCustomers();
        
        for(Customer current_customer: all_customers){
            HashSet<String> current_wishlist = current_customer.getWishlist();
            if(current_wishlist == null){
                continue;
            }

            if(current_wishlist.contains(product.getProduct_id())){
                ResponseEntity<String> response = email_sender.sendEmail(
                    current_customer.getEmail(),
                    null,
                    "sale_alert",
                    product.getProduct_id(),
                    new_price
                );

                if (!response.getStatusCode().equals(HttpStatus.OK)) {
                    System.out.println("Failed to send email to " + current_customer.getEmail() + ": " + response.getBody());
                } 
            }
        }

        return product_repo.save(product);
    }

    public Refund approve_refund(Refund refund) throws Exception{
        refund.setApprovalStatus("approved");

        Product product = product_repo.findById(refund.getRefund_productID()).get();
        int past_stock = product.getStock();
        product.setStock(past_stock + refund.getRefund_pieces());
        product_repo.save(product);

        ResponseEntity<String> response = email_sender.sendEmail(
                    refund.getRefundCustomer().getEmail(),
                    null,
                    "refund",
                    refund.getRefund_productID(),
                    refund.getRefund_amount()
        );

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            System.out.println("Failed to send email to " + refund.getRefundCustomer().getEmail() + ": " + response.getBody());
        }

        return refund_repo.save(refund);
    }

    public Refund reject_refund(Refund refund) throws Exception{
        refund.setApprovalStatus("rejected");

        ResponseEntity<String> response = email_sender.sendEmail(
                    refund.getRefundCustomer().getEmail(),
                    null,
                    "no-refund",
                    refund.getRefund_productID(),
                    refund.getRefund_amount()
        );

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            System.out.println("Failed to send email to " + refund.getRefundCustomer().getEmail() + ": " + response.getBody());
        }

        return refund_repo.save(refund);
    }
    
    public List<Refund> get_waiting_refunds(){
        List<Refund> all = refund_repo.findAll();
        for (Refund ref: all){
            if(!ref.getApprovalStatus().equals("waiting-approval")){
                all.remove(ref);
            }
        }
        return all;
    }

    public List<Product> pending_products(){
        List<Product> all = product_repo.findAll();
        for (Product prod: all){
            if(prod.getUnitPrice() > 0){
                all.remove(prod);
            }
        }
        return all;
    }

    public Product set_price(Product product, double price){
        product.setUnitPrice(price);
        return product_repo.save(product);
    }

    public List<Invoice> range_search(Instant startDate, Instant endDate){
        return invoice_repo.findByDateBetween(startDate, endDate);
    }

    public Map<String, Object> get_chart(Instant startDate, Instant endDate) {
        List<Invoice> invoices = invoice_repo.findByDateBetween(startDate, endDate);

        double revenue = 0.0;
        double cost = 0.0;

        for (Invoice inv : invoices) {
            revenue += inv.getTotal_price();
            cost += inv.getTotal_price() * 0.7; // Assuming cost is 70% of the total price
        }

        double profit = revenue - cost;

        Map<String, Object> result = new HashMap<>();
        result.put("revenue", revenue);
        result.put("cost", cost);
        result.put("profit", profit);

        return result;
    }


    public ResponseEntity<byte[]> download_pdf(String invoiceID){
        Invoice invoice = invoice_repo.findById(invoiceID).orElseThrow(() -> new RuntimeException("Invoice not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("Invoice Details"));
        document.add(new Paragraph("ID: " + invoice.getInvoiceId()));
        document.add(new Paragraph("Customer: " + invoice.getPurchaser().getAccount_id()));
        document.add(new Paragraph("Amount: " + invoice.getTotal_price()));
        document.add(new Paragraph("Date: " + invoice.getDate()));
        document.add(new Paragraph("Address: " + invoice.getAddress()));
        document.add(new Paragraph("Status: " + invoice.getOrderStatus()));



        document.close();

        byte[] pdfBytes = baos.toByteArray();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice_" + invoiceID + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}

