package org.project.controller;

import org.project.model.Customer;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private UserService userService; // Service katmanını kullanacağız

    @GetMapping
    public List<Customer> getAllCustomers() {
        return userService.getAllCustomers();
    }

    @PostMapping("/register")
    public String registerCustomer(@RequestBody Customer customer) {
        try {
            userService.registerCustomer(customer);
            return "Customer registered successfully!";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
