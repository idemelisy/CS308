package org.project.model;

import java.util.Map;

import org.project.model.product_model.Product;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;


@Document("receipts")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Invoice {

    @Id
    private String InvoiceId;
    private Customer purchaser;
    private Map<Product, Integer> purchased;
    private double total_price;
    
}
