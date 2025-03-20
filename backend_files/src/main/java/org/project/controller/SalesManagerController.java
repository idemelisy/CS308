package org.project.controller;

import org.project.model.SalesManager;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales-managers")
public class SalesManagerController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<SalesManager> getAllSalesManagers() {
        return userService.getAllSalesManagers();
    }
}
