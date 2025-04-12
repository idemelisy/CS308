package org.project.controller;

import org.project.model.Customer;
import org.project.model.Invoice;
import org.project.model.product_model.Product;
import org.project.service.CustomerService;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private UserService userService;

    @Autowired
    private CustomerService customerService;

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

    @PostMapping("/add-to-cart")
    public String addToCart(@RequestBody Product product, @RequestParam String email){
        return customerService.add_to_cart(product, email);
    }

    @DeleteMapping("/delete-from-cart")
    public String deleteFromCart(@RequestBody Product product, @RequestParam String email){
        return customerService.delete_from_cart(product,email);
    }

    @PostMapping("/checkout")
    public Invoice checkout(@RequestBody Customer customer){
        return customerService.checkout(customer);
    }

    @GetMapping("/shopping-history")
    public List<Invoice> getShoppingHistory(@RequestParam String customerID){
        return customerService.see_shopping_history(customerID);
    }
}
