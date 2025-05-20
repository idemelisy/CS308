package org.project.controller;

import org.project.model.Invoice;
import org.project.model.ProductManager;
import org.project.model.product_model.Comment;
import org.project.model.product_model.Product;
import org.project.repository.UserRepository;
import org.project.service.ProductManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-managers")
public class ProductManagerController {

    @Autowired
    private ProductManagerService managerService;

    @Autowired 
    private UserRepository user_repo;

    @GetMapping
    public List<ProductManager> get_product_manager(){
        return user_repo.findAllProductManagers();
    }

    @GetMapping("/get-waiting-approvals")
    public List<Comment> get_waiting_approvals() {
        return managerService.list_waiting_approvals();
    }

    @PostMapping("/reject-comment")
    public Comment reject_comment(@RequestBody Comment comment){
        return managerService.reject_comment(comment);
    }

    @PostMapping("/approve-comment")
    public Comment approve_comment(@RequestBody Comment comment){
        return managerService.approve_comment(comment);
    }

    @GetMapping("/get-orders")
    public List<Invoice> get_all_orders(){
        return managerService.get_all_orders();
    }

    @PostMapping("/advance-order-status")
    public Invoice advance_status(@RequestBody Invoice invoice){
        return managerService.advance_order_status(invoice);
    }

    @PostMapping("/add-product")
    public Product add_product(@RequestBody Product product) {
        return managerService.add_product(product);
    }
}
