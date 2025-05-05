package org.project.controller;

import org.project.model.Refund;
import org.project.model.SalesManager;
import org.project.model.product_model.Product;
import org.project.service.SalesManagerService;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales-managers")
public class SalesManagerController {

    @Autowired
    private UserService userService;

    @Autowired
    private SalesManagerService manager_service;

    @GetMapping
    public List<SalesManager> getAllSalesManagers() {
        return userService.getAllSalesManagers();
    }

    @PostMapping("declare-sale")
    public Product set_sale(@RequestBody Product product, @RequestParam double new_price) throws Exception{
        return manager_service.declare_sale(product, new_price);
    }

    @PostMapping("approve-refund")
    public Refund approve_refund(Refund refund) throws Exception{
        return manager_service.approve_refund(refund);
    }

    @PostMapping("reject-refund")
    public Refund reject_refund(Refund refund) throws Exception{
        return manager_service.reject_refund(refund);
    } 

    @GetMapping("waiting-approvals")
    public List<Refund> get_waiting_refunds(){
        return manager_service.get_waiting_refunds();
    }
}
