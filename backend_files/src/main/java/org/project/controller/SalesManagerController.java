package org.project.controller;

import org.project.model.Invoice;
import org.project.model.Refund;
import org.project.model.SalesManager;
import org.project.model.product_model.Product;
import org.project.service.SalesManagerService;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

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

    @PostMapping("/declare-sale")
    public Product set_sale(@RequestBody Product product, @RequestParam("new_price") double new_price) throws Exception{
        return manager_service.declare_sale(product, new_price);
    }

    @PostMapping("/approve-refund")
    public Refund approve_refund(@RequestBody Refund refund) throws Exception{
        return manager_service.approve_refund(refund);
    }

    @PostMapping("/reject-refund")
    public Refund reject_refund(@RequestBody Refund refund) throws Exception{
        return manager_service.reject_refund(refund);
    } 

    @GetMapping("/waiting-approvals")
    public List<Refund> get_waiting_refunds(){
        return manager_service.get_waiting_refunds();
    }

    @PostMapping("/set-price")
    public Product set_price(@RequestBody Product product, @RequestParam("price") double price){
        return manager_service.set_price(product, price);
    }

    @GetMapping("/range-invoices")
    public List<Invoice> get_invoices(@RequestParam("start_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start_date,
                                      @RequestParam("end_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end_date){

        return manager_service.range_search(start_date, end_date);
    }

    @GetMapping("/get-chart")
    public Map<String, Object> get_chart(@RequestParam("start_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant start_date,
                                         @RequestParam("end_date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant end_date){

        return manager_service.get_chart(start_date, end_date);
    }

    @GetMapping("/download-invoice")
    public ResponseEntity<byte[]> download_invoice(@RequestParam("invoice_id") String invoice_id) throws Exception{
        return manager_service.download_pdf(invoice_id);
    }
}
