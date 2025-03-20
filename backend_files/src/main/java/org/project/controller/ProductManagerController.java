package org.project.controller;

import org.project.model.ProductManager;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-managers")
public class ProductManagerController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<ProductManager> getAllProductManagers() {
        return userService.getAllProductManagers();
    }

    @PostMapping("/register")
    public String registerProductManager(@RequestBody ProductManager productManager) {
        try {
            userService.registerProductManager(productManager);
            return "Product Manager registered successfully!";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
