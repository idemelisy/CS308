package org.project.service;

import java.util.HashSet;
import java.util.List;

import org.project.model.Customer;
import org.project.model.Refund;
import org.project.model.product_model.Product;
import org.project.repository.ProductRepository;
import org.project.repository.RefundRepository;
import org.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;



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


    public Product declare_sale(Product product, double new_price) throws Exception{
        product.setUnitPrice(new_price);

        List<Customer> all_customers = user_repo.findAllCustomers();
        
        for(Customer current_customer: all_customers){
            HashSet<String> current_wishlist = current_customer.getWishlist();
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
}
