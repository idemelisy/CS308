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
    private UserService userService;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return userService.getAllCustomers();
    }
}
