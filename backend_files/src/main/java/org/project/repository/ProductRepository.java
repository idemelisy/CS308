package org.project.repository;

import org.project.model.product_model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface ProductRepository extends MongoRepository<Product, String>{
    Product findByProductName(String product_name);
    List<Product> findAll();

    List<Product> findByCategory(String category);

    List<Product> findByNameContainingIgnoreCase(String productName);
    List<Product> findByNameContainingOrDecriptionContainingAllIgnoreCase(String productName, String description);
}
