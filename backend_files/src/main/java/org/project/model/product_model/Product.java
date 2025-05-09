package org.project.model.product_model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Product {

    @Id
    private String product_id;
    private String name;
    private String model;
    private String serialNumber;
    private String description;
    private double unitPrice;
    private int stock;
    private String category;
    private String warrantyStatus;
    private String distributorID;
    
}
