package org.project.controller;

import org.project.model.Customer;
import org.project.model.Guest;
import org.project.model.Invoice;
//import org.project.model.Refund;
import org.project.model.User;
import org.project.model.product_model.Product;
import org.project.repository.UserRepository;
import org.project.service.CustomerService;
import org.project.service.ProductService;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private UserService userService;
    @Autowired
    private ProductService productService;
    @Autowired
    private CustomerService customerService;

    @Autowired UserRepository user_repo;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return userService.getAllCustomers();
    }

    @GetMapping("/get-cart")
    public HashMap<String, Integer> getCart(@RequestParam String customerID){
        User user = user_repo.findById(customerID).get();
        Customer customer = (Customer) user;
        return customerService.getShoppingCart(customer);
    }

    @GetMapping("/get-guest-cart")
    public HashMap<String, Integer> getGuestCart(@RequestParam String customerID){
        User user = user_repo.findById(customerID).get();
        Guest customer = (Guest) user;
        return customerService.getShoppingCart(customer);
    }

    @PostMapping("/add-to-cart")
    public String addToCart(@RequestBody Product product, @RequestParam String email){
        return customerService.add_to_cart(product, email);
    }

    @PostMapping("/add-to-guest-cart")
    public String addToGuestCart(@RequestBody Product product, @RequestParam String email){
        return customerService.add_to_guest_cart(product, email);
    }

    @DeleteMapping("/delete-from-cart")
    public String deleteFromCart(@RequestBody Product product, @RequestParam String email){
        return customerService.delete_from_cart(product,email);
    }

    @DeleteMapping("/delete-from-guest-cart")
    public String deleteFromGuestCart(@RequestBody Product product, @RequestParam String email){
        return customerService.delete_from_guest_cart(product,email);
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

    @PostMapping("add-wishlist")
    public Customer add_to_wishlist(@RequestBody Product product, @RequestParam String customerID){
        return customerService.add_to_wishlist(product, customerID);
    }
    @GetMapping("get-wishlist")
    public List<Product> get_wishlist(@RequestParam String customerID) {
        Customer customer = (Customer) user_repo.findById(customerID).get();
        Set<String> productIds = customer.getWishlist();

        List<Product> wishlistProducts = new ArrayList<>();

        for (String productId : productIds) {
            Product product = productService.find_product(productId);
            if (product != null) {
                wishlistProducts.add(product);
            }
        }

        return wishlistProducts;
    }


    @PostMapping("drop-wishlist")
    public Customer drop_wishlist(@RequestBody Product product, @RequestParam String customerID){
        return customerService.drop_from_wishlist(product, customerID);
    }
/*
    @PostMapping("request-refund")
    public Refund request_refund(@RequestParam String productID, @RequestBody Customer customer, @RequestParam int refund_amount){
        return customerService.request_refund(productID, customer, refund_amount);
    }*/
}
