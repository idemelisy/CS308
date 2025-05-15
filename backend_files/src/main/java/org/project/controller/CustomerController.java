package org.project.controller;

import jakarta.mail.MessagingException;
import org.project.model.*;
import org.project.model.product_model.Product;
import org.project.repository.UserRepository;
import org.project.service.CustomerService;
import org.project.service.EmailSenderService;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private UserService userService;

    @Autowired
    private CustomerService customerService;

    @Autowired 
    private UserRepository user_repo;

    @Autowired
    private EmailSenderService emailSenderService;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return userService.getAllCustomers();
    }

    @GetMapping("/get-cart")
    public HashMap<String, Integer> getCart(@RequestParam String customerID){
        User user = user_repo.findById(customerID).get();
        if (user instanceof Customer){
            Customer customer = (Customer) user;
            return customerService.getShoppingCart(customer);
        }
        else{
            Guest guest = (Guest) user;
            return customerService.getShoppingCart(guest);
        }
    }

    @PostMapping("/add-to-cart")
    public String addToCart(@RequestBody Product product, @RequestParam String email){
        User user = user_repo.findByEmail(email);
        if (user instanceof Guest) return customerService.add_to_guest_cart(product, email);
        else return customerService.add_to_cart(product, email);
    }

    @DeleteMapping("/delete-from-cart")
    public String deleteFromCart(@RequestBody Product product, @RequestParam String email){
        User user = user_repo.findByEmail(email);
        if (user instanceof Guest) return customerService.delete_from_guest_cart(product,email);
        else return customerService.delete_from_cart(product, email);
    }

    @PostMapping("/checkout")
    public Invoice checkout(@RequestBody Customer customer){
        return customerService.checkout(customer);
    }

    @GetMapping("/in-cart-total")
    public double inCartTotal(@RequestParam String customerID){
        return customerService.in_cart_total(customerID);
    }

    @GetMapping("/shopping-history")
    public List<Invoice> getShoppingHistory(@RequestParam String customerID){     
        return customerService.see_shopping_history(customerID);
    }

    @PostMapping("/send-invoice")
    public void sendInvoiceMail(@RequestParam String toEmail, @RequestParam MultipartFile file) throws MessagingException{
        emailSenderService.sendEmail(toEmail, file, "invoice", "", 0);
    }

    @PostMapping("add-wishlist")
    public Customer add_to_wishlist(@RequestBody Product product, @RequestParam String customerID){
        return customerService.add_to_wishlist(product, customerID);
    }

    @PostMapping("drop-wishlist")
    public Customer drop_wishlist(@RequestBody Product product, @RequestParam String customerID){
        return customerService.drop_from_wishlist(product, customerID);
    }

    @PostMapping("request-refund")
    public Refund request_refund(@RequestParam String productID, @RequestBody Customer customer, @RequestParam int refund_amount) throws Exception{
        return customerService.request_refund(productID, customer, refund_amount);
    }
}
