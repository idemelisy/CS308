package org.project.model.product_model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "products")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Product {

    @Id
    private String product_id;
    private String productName;
    private String description;
    private float unit_price;
    private int stock;
    private List<RatingAndComment> ratings_and_comments;  
  
}
